// S1: organization isolation helper.
// Merges the logged-in user's organization (from the JWT, never from the
// request body or URL) into a query filter.
//
//   events.findOne(withOrg({ _id: req.params.id }, req))
//   clients.find(withOrg({}, req, 'orgs'))      // clients keep their orgs in an array field
//
// The org value is written LAST so a filter can never override it, and it is a
// real ObjectId so it also works inside aggregate() $match, where Mongoose does
// not cast strings for you.
const mongoose = require('mongoose');

function withOrg(filter, req, field = 'org') {
  return {
    ...filter,
    [field]: new mongoose.Types.ObjectId(req.user.orgId)
  };
}

// Removes ownership fields from a request body so an update or create can never
// move a record into another organization.
function stripOrgFields(body) {
  const { _id, org, orgs, ...rest } = body || {};
  return rest;
}

module.exports = { withOrg, stripOrgFields };
