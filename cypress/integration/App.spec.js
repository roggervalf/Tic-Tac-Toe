/// <reference types="cypress" />

import { ticTacToeMachine } from "../../src/machine";
import { createModel } from "@xstate/test";

ticTacToeMachine.states.onGame.meta = {
  test: function () {
    cy.get(".modal").should("not.exist");
  },
};

ticTacToeMachine.states.win.meta = {
  test: function () {
    cy.get(".modal-title").should("not.have.value", "Draw");
  },
};

ticTacToeMachine.states.win.meta = {
  test: function () {
    cy.get(".modal-title").should("have.value", "Draw");
  },
};

const testModel = createModel(ticTacToeMachine, {
  events: {
    ON_CLICK: function () {
      cy.get('.remove-top-border.remove-left-border > img').click();
    },
    RESET_SCORE: function () {
      cy.get('[data-testid=reset-score]').click();
    },
    RESET: function () {
      cy.get('[data-testid=reset-board]').click();
    },
  },
});

const itVisitsAndRunsPathTests = (url) => (path) =>
  it(path.description, function () {
    cy.visit(url).then(path.test);
  });

const itTests = itVisitsAndRunsPathTests(
  'http://localhost:3001'
);

context("Feedback App", () => {
  const testPlans = testModel.getSimplePathPlans();
  testPlans.forEach((plan) => {
    describe(plan.description, () => {
      plan.paths.forEach(itTests);
    });
  });
});
