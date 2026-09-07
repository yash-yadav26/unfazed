const cron = require("node-cron");

const {
  completeExpiredSessions,
} = require("../modules/session/services/session.service");

/* -------------------------------------------------------------------------- */
/*                       Session Completion Job                               */
/* -------------------------------------------------------------------------- */

/**
 * Checks expired sessions every minute.
 *
 * Session completion is handled inside joinSession():
 *
 * 1. First participant joins
 *    -> IN_PROGRESS
 *
 * 2. Second participant joins
 *    -> COMPLETED
 *
 * This cron job handles only sessions whose
 * scheduled end time has passed and were not completed.
 *
 * 3. Client joined, Therapist did not
 *    -> NO_SHOW
 *    -> Client notification
 *
 * 4. Therapist joined, Client did not
 *    -> NO_SHOW
 *    -> Therapist notification
 *
 * 5. Neither joined
 *    -> NO_SHOW
 *    -> Client + Therapist notification
 */
const startSessionCompletionJob = () => {
  cron.schedule(
    "* * * * *",
    async () => {
      try {
        const result = await completeExpiredSessions();

        if (!result) {
          return;
        }

        if (result.noShowCount > 0) {
          console.log(
            `[SessionCompletionJob] ${result.noShowCount} session(s) marked as NO_SHOW.`,
          );
        }
      } catch (error) {
        console.error(
          "[SessionCompletionJob] Failed to process expired sessions:",
          error,
        );
      }
    },
    {
      timezone: "Asia/Kolkata",
    },
  );

  console.log(
    "[SessionCompletionJob] Started. Checking expired sessions every minute.",
  );
};

/* -------------------------------------------------------------------------- */
/*                                  Export                                    */
/* -------------------------------------------------------------------------- */

module.exports = startSessionCompletionJob;
