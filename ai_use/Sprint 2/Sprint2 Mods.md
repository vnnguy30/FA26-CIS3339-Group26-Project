Sprint 2 bug fixes and modifications  
Team member: Ambar C. Pineda  
AI tool: Claude  
Dates: October 30 \- 31 2026  
Repo: [https\://github.com/vnnguy30/FA26-CIS3339-Group26-Project.git](https://github.com/vnnguy30/FA26-CIS3339-Group26-Project.git)

This is what I asked the AI in regards to finalizing Sprint 2\. The prompts are in my own words, and the AI's answers are summarized. The code shown represents the fixes and configurations applied to the project.

### 1\. Starting the task and generating code

**User prompt:** I am in charge of doing f2. With the current state of the repository is it possible for me to complete this task or should I wait for other tasks to be complete? ... create all the code needed for f2 please  
**Response:** The AI confirmed F2 was unblocked. It then generated the `useApi.js` composable, the `api.js` interceptor, and migrated the Vue files from the Options API to the Composition API (`<script setup>`) to satisfy Sprint 2 requirements.

### 2\. The Git Deletion Pitfall and Case-Sensitivity

**User prompt:** take a look \[at my zip file\]  
**Response:** The AI diagnosed a major pitfall: while I was modifying the Vue scripts, I had deleted 21 crucial frontend files (like `package.json`, `index.html`, etc.). It provided terminal commands using `git checkout HEAD~1` to restore the deleted files without overwriting my new F2 progress on the Vue scripts. It also caught a case-sensitivity issue where `useAPI.js` needed to be renamed to `useApi.js` using `git mv` so it wouldn't break on Linux/deployment.

```sh
git diff --diff-filter=D --name-only HEAD~1 HEAD | xargs git checkout HEAD~1
git mv CIS-3339-Project/frontend/src/composables/useAPI.js CIS-3339-Project/frontend/src/composables/tmp.js
git mv CIS-3339-Project/frontend/src/composables/tmp.js CIS-3339-Project/frontend/src/composables/useApi.js
```

3\. Database Setup and Seeding (Building D1 early)

**User prompt:** How do i get Mongo db running? ... Let's build d1 then  
**Response:** I was confused why my database wasn't connecting despite having MongoDB Compass. The AI explained that Compass is just a viewer and walked me through installing MongoDB Community Server. Because the database was empty and the D1 (seeding) task wasn't actually done by my team yet, the AI generated a full `db-init.js` seed script to create the necessary test organization, users, and dummy data so I could test my F2 login/error logic.

### 4\. Troubleshooting Terminal and Install Issues

**User prompt:** my frontend is stuck on this help \[npm install\]  
**Response:** The AI explained that `npm install` can sometimes hang silently and provided commands to verify if the `node_modules` folder was already populated. It also corrected me when I tried running `npm install` in the root folder instead of the `frontend` directory.

### 5\. Updating Documentation

**User prompt:** Should a read me be included for the repo? especially since the .env has changed  
**Response:** The AI agreed and provided a markdown table documenting the new environment variables (like `SEED_ORG_NAME` and `CORS_ORIGIN`) and step-by-step instructions for a fresh clone to ensure graders could run the project easily.

### 6\. What the AI did vs. what I decided

**AI helped with:** Catching and providing the exact Git commands to fix a accidental file deletion, explaining the MongoDB Community vs. Compass difference, and generating a database seed script.  
**I did / decided:** When implementing the seed script, I decided *not* to blindly overwrite the `package.json` and `.env` files as the AI initially provided in its zip. Instead, I manually copied the `scripts` folder over and hand-edited the JSON and ENV files to ensure I didn't accidentally delete any recent configurations my teammates might have added. I also actively requested the README updates at the end to ensure our documentation matched our new environment variables.

### What I learned

I learned how easily Git can accidentally track file deletions when modifying Vue scripts and committing from the wrong directory context, and how to recover from it using `git diff` and `git checkout`. I learned about OS file case-sensitivity (`useAPI` vs `useApi`) and why a fresh clone check is the best way to verify what a grader will actually see. Finally, I learned the critical difference between a database viewer (Compass) and the actual database service (Community Server).