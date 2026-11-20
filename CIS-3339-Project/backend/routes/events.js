// This file contains API endpoints for interacting with the "events" collection in the MongoDB database
const express = require("express");
const router = express.Router();

// S1: requireAuth = valid JWT, requireRole('editor') = editors only (403 otherwise).
// withOrg() scopes every query to the organization in the user's token (req.user.orgId).
const requireAuth = require("../auth/requireAuth");
const requireRole = require("../auth/requireRole");
const { withOrg, stripOrgFields } = require("../utils/withOrg");

// importing data model schemas
const { events, clients } = require("../models/models");
const httpError = require("../utils/httpError");

// API endpoint to get all events for org
router.get("/", requireAuth, (req, res, next) => {
  events
    .find(withOrg({}, req), (error, data) => {
      if (error) {
        return next(error);
      } else {
        return res.json(data);
      }
    })
    // sort by date descending
    .sort({ date: -1 });
});

// API endpoint to GET single event by ID
router.get("/id/:id", requireAuth, (req, res, next) => {
  events.findOne(withOrg({ _id: req.params.id }, req), (error, data) => {
    if (error) {
      return next(error);
    } else if (!data) {
      return next(httpError(404, "Not found"));
    } else {
      res.json(data);
    }
  });
});

// API endpoint to GET events based on search query
// Ex: '...?name=Food&searchBy=name'
router.get("/search/", requireAuth, (req, res, next) => {
  const dbQuery = withOrg({}, req);
  switch (req.query.searchBy) {
    case "name":
      dbQuery.name = { $regex: `${req.query.name}`, $options: "i" };
      break;
    case "date":
      dbQuery.date = req.query.eventDate;
      break;
    default:
      return next(httpError(400, "Invalid searchBy"));
  }
  events.find(dbQuery, (error, data) => {
    if (error) {
      return next(error);
    } else {
      res.json(data);
    }
  });
});

// API endpoint to GET events for which a client is signed up
router.get("/client/:id", requireAuth, (req, res, next) => {
  events.find(withOrg({ attendees: req.params.id }, req), (error, data) => {
    if (error) {
      return next(error);
    } else {
      res.json(data);
    }
  });
});

// API endpoint to GET events for which a client is not signed up
router.get(
  "/client/:id/not-registered",
  requireAuth,
  async (req, res, next) => {
    try {
      const eventsNotRegistered = await events.find(
        withOrg({ attendees: { $nin: [req.params.id] } }, req)
      );
      res.json(eventsNotRegistered);
    } catch (error) {
      next(error);
    }
  }
);

// API endpoint to GET attendee details for an event
router.get("/attendees/:id", requireAuth, (req, res, next) => {
  events.findOne(withOrg({ _id: req.params.id }, req), (error, event) => {
    if (error) {
      return next(error);
    } else if (!event) {
      return next(httpError(404, "Not found"));
    } else {
      const attendeeIds = event.attendees.map((attendee) =>
        attendee.toString()
      );
      // clients are scoped to the org too, not just the event
      clients.find(
        withOrg({ _id: { $in: attendeeIds } }, req, "orgs"),
        (error, found) => {
          if (error) {
            return next(error);
          } else {
            res.json(found);
          }
        }
      );
    }
  });
});

// API endpoint to GET all events for a given service
router.get("/service/:id", requireAuth, async (req, res, next) => {
  try {
    const eventsWithService = await events
      .find(withOrg({ services: { $in: [req.params.id] } }, req))
      .select({ _id: 1, name: 1, date: 1, address: { line1: 1 } })
      .lean();
    res.json(eventsWithService);
  } catch (error) {
    next(error);
  }
});

// API endpoint to POST new event
router.post("/", requireAuth, requireRole("editor"), (req, res, next) => {
  // org is taken from the token; anything the client sent for it is ignored
  const newEvent = withOrg(stripOrgFields(req.body), req);
  events.create(newEvent, (error, data) => {
    if (error) {
      return next(error);
    } else {
      res.status(200).send("New event created successfully");
    }
  });
});

// API endpoint to PUT -> update event
router.put("/update/:id", requireAuth, requireRole("editor"), (req, res, next) => {
  events.findOneAndUpdate(
    withOrg({ _id: req.params.id }, req),
    stripOrgFields(req.body),
    (error, data) => {
      if (error) {
        return next(error);
      } else if (!data) {
        return next(httpError(404, "Not found"));
      } else {
        res.status(200).send("Event updated successfully");
      }
    }
  );
});

// API endpoint to PUT -> add attendee to event
// Both the event and the client must exist in the user's org, otherwise 404.
router.put("/register", requireAuth, requireRole("editor"), (req, res, next) => {
  events.findOne(
    withOrg({ _id: req.query.event }, req),
    (error, event) => {
      if (error) return next(error);
      if (!event) return next(httpError(404, "Not found"));

      clients.findOne(
        withOrg({ _id: req.query.client }, req, "orgs"),
        (error, client) => {
          if (error) return next(error);
          if (!client) return next(httpError(404, "Not found"));

          // only add attendee if not yet signed up
          const alreadyRegistered = event.attendees.some(
            (id) => id.toString() === client._id.toString()
          );
          if (alreadyRegistered) {
            return res.status(400).send("Client already added to event");
          }

          events.findOneAndUpdate(
            withOrg({ _id: event._id }, req),
            { $push: { attendees: client._id } },
            (error) => {
              if (error) {
                return next(error);
              } else {
                res.status(200).send("Client added to event");
              }
            }
          );
        }
      );
    }
  );
});

// API endpoint to PUT -> remove attendee from event
router.put("/deregister", requireAuth, requireRole("editor"), (req, res, next) => {
  events.findOne(
    withOrg({ _id: req.query.event }, req),
    (error, event) => {
      if (error) return next(error);
      if (!event) return next(httpError(404, "Not found"));

      clients.findOne(
        withOrg({ _id: req.query.client }, req, "orgs"),
        (error, client) => {
          if (error) return next(error);
          if (!client) return next(httpError(404, "Not found"));

          events.findOneAndUpdate(
            withOrg({ _id: event._id }, req),
            { $pull: { attendees: client._id } },
            (error) => {
              if (error) {
                return next(error);
              } else {
                res.send("Client deregistered with event");
              }
            }
          );
        }
      );
    }
  );
});

// API endpoint to hard DELETE event by ID
router.delete("/:id", requireAuth, requireRole("editor"), (req, res, next) => {
  events.findOne(withOrg({ _id: req.params.id }, req), (error, data) => {
    if (error) {
      return next(error);
    } else if (!data) {
      return next(httpError(404, "Not found"));
    } else {
      // only delete event if no clients are signed up
      if (data.attendees.length === 0) {
        events.findOneAndDelete(
          withOrg({ _id: req.params.id }, req),
          (error, data) => {
            if (error) {
              return next(error);
            } else if (!data) {
              return next(httpError(404, "Not found"));
            } else {
              res.status(200).send("Event deleted successfully");
            }
          }
        );
      } else {
        return next(httpError(409, "Event has attendees and can't be deleted"));
      }
    }
  });
});

// GET event attendance for the past two months for dashboard
router.get("/attendance", requireAuth, (req, res, next) => {
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
  events
    .find(withOrg({ date: { $gte: twoMonthsAgo } }, req), (error, data) => {
      if (error) {
        return next(error);
      } else {
        res.json(data);
      }
    })
    .sort({ date: 1 });
});

module.exports = router;
