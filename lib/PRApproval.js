const AddLabel = require("./addLabels");
const Config = require("../config/config");

function requestedReview(app) {
  app.on(
    [
      "pull_request.opened",
      "pull_request.closed",
      "pull_request.edited",
      "pull_request.synchronize",
      "pull_request.reopened",
      "pull_request.ready_for_review",
      "pull_request_review.submitted",
      "pull_request_review.dismissed",
    ],
    async (context) => {
      const pullRequest = context.payload.pull_request;
      const reviewResult = context.payload.review;
      const labelToAdd = "READY TO MERGE";
      const requestChangesLabel = "PR: Changes Requested";
      let length = 0;
      let approvals = 0;

      const { requested_reviewers } = pullRequest;
      const { state } = reviewResult;

      if (state === "approved") {
        approvals = approvals + 1;
      }

      if (state === "changes_requested") {
        // remove existing READY TO MERGE label if it exists
        pullRequest.labels.map((prLabel) => {
          if (prLabel.name === labelToAdd) {
            context.github.issues.removeLabel(
              context.issue({
                name: prLabel.name,
              })
            );
          }
          AddLabel.addLabel(
            context,
            requestChangesLabel,
            Config.colors[requestChangesLabel]
          );
        });
      }

      requested_reviewers.map((req, i) => (length = i + 1));

      // Add the READY TO MERGE label is two approvals have been received
      if (approvals === 2) {
        AddLabel.addLabel(context, labelToAdd, Config.colors[labelToAdd]);
      }
    }
  );
}

module.exports = {
  requestedReview,
};
