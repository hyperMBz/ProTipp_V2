import { LinearClient } from "@linear/sdk";

// Ez a kliens szerver oldalon fog futni, biztonságosan hozzáférve a környezeti változókhoz.
export const linearClient = new LinearClient({
  apiKey: process.env.LINEAR_API_KEY,
});

// Basic structure for creating issues
interface IssueData {
    title: string;
    description: string;
    priority?: number; // 0: No priority, 1: Urgent, 2: High, 3: Medium, 4: Low
}

export class BMADLinearService {
    private teamId: string;

    constructor() {
        if (!process.env.LINEAR_TEAM_ID) {
            throw new Error("LINEAR_TEAM_ID environment variable is not set.");
        }
        this.teamId = process.env.LINEAR_TEAM_ID;
    }

    private async getOrCreateLabel(labelName: string, color: string = '#ededed') {
        const labels = await linearClient.issueLabels({
            filter: { name: { eq: labelName } }
        });

        if (labels.nodes.length > 0) {
            return labels.nodes[0];
        } else {
            const newLabel = await linearClient.issueLabelCreate({ name: labelName, color });
            return newLabel.issueLabel;
        }
    }

    private async getWorkflowState(stateName: string, teamId: string) {
        const team = await linearClient.team(teamId);
        const states = await team.states({
            filter: { name: { eq: stateName } }
        });
        return states.nodes.length > 0 ? states.nodes[0] : null;
    }

    async createStory(storyData: IssueData) {
        const bmadLabel = await this.getOrCreateLabel("BMAD");
        const todoState = await this.getWorkflowState("Todo", this.teamId);

        if (!todoState) {
            throw new Error(`Workflow state 'Todo' not found for team ${this.teamId}.`);
        }

        const issue = await linearClient.createIssue({
            teamId: this.teamId,
            title: storyData.title,
            description: storyData.description,
            priority: storyData.priority,
            labelIds: [bmadLabel.id],
            stateId: todoState.id,
        });

        return issue.issue;
    }

    async updateStoryStatus(issueId: string, targetStateName: string) {
        const targetState = await this.getWorkflowState(targetStateName, this.teamId);

        if (!targetState) {
            throw new Error(`Workflow state '${targetStateName}' not found for team ${this.teamId}.`);
        }

        const updatedIssue = await linearClient.updateIssue(issueId, {
            stateId: targetState.id,
        });

        return updatedIssue.issue;
    }

    async createBug(bugData: IssueData) {
        const bugLabel = await this.getOrCreateLabel("Bug", '#f44336');
        const todoState = await this.getWorkflowState("Todo", this.teamId);

        if (!todoState) {
            throw new Error(`Workflow state 'Todo' not found for team ${this.teamId}.`);
        }

        const issue = await linearClient.createIssue({
            teamId: this.teamId,
            title: bugData.title,
            description: bugData.description,
            priority: bugData.priority || 1, // Default to Urgent for bugs
            labelIds: [bugLabel.id],
            stateId: todoState.id,
        });

        return issue.issue;
    }
}
