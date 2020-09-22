const AddLabel = require("./addLabels");
const Config = require("../config/config");

//Import Schema for Approval from model
const Approval = require("../models/approval");

let isUser = false;

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
      const PRaction = context.payload.action;
      const { url } = context.payload.pull_request;

      const labelToAdd = "READY TO MERGE";
      const requestChangesLabel = "PR: Changes Requested";

      if (PRaction === "opened") {
        const approval = new Approval({
          pullRequestURL: url,
          usersApproved: [],
          approvals: 0,
        });
        approval
          .save()
          .then((approval) => console.log("Saved to Database\n", approval))
          .catch((err) => console.log(err));
      }

      if (PRaction === "submitted") {
        const { state, user } = context.payload.review;
        const { login } = user;
        if (state === "approved") {
          Approval.findOne({ pullRequestURL: url })
            .then((approval) => {
              approval.usersApproved.map((reviewers) => {
                console.log("Reviewers : ", reviewers);
                console.log("Login : ", login);
                if (reviewers === login) {
                  isUser = true;
                }
              });

              if (approval.usersApproved.length === 0) {
                Approval.findOneAndUpdate(
                  { pullRequestURL: url },
                  {
                    approvals: approval.approvals + 1,
                    usersApproved: [...approval.usersApproved, login],
                  },
                  { new: true }
                )
                  .then((updated) => console.log(updated))
                  .catch((err) => console.log(" Problem Updating", err));
              } else {
                if (isUser !== true) {
                  Approval.findOneAndUpdate(
                    { pullRequestURL: url },
                    {
                      approvals: approval.approvals + 1,
                      usersApproved: [...approval.usersApproved, login],
                    },
                    { new: true }
                  )
                    .then((updated) => {
                      console.log(updated.approvals);
                      // Add the READY TO MERGE label is two approvals have been received
                      if (updated.approvals === 2) {
                        AddLabel.addLabel(
                          context,
                          labelToAdd,
                          Config.colors[labelToAdd]
                        );
                      }
                    })
                    .catch((err) => console.log(" Problem Updating", err));
                }
              }
            })
            .catch((err) => console.log(err));
        }
      }

      if (PRaction === "submitted") {
        const { state, user } = context.payload.review;
        const pullRequest = context.payload.pull_request;
        const { login } = user;
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

          Approval.findOne({ pullRequestURL: url })
            .then((approval) => {
              approval.usersApproved.map((reviewers) => {
                console.log("Reviewers : ", reviewers);
                console.log("Login : ", login);
                if (reviewers === login) {
                  isUser = true;
                }
              });

              if (isUser === true) {
                Approval.findOneAndUpdate(
                  { pullRequestURL: url },
                  {
                    approvals: approval.approvals - 1,
                    usersApproved: approval.usersApproved.filter(
                      (item) => item !== login
                    ),
                  },
                  { new: true }
                )
                  .then((updated) => {
                    console.log(updated);
                  })
                  .catch((err) => console.log(" Problem Updating", err));
              }
            })
            .catch((err) => console.log(err));
        }
      }
    }
  );
}

module.exports = {
  requestedReview,
};
