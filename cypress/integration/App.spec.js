/// <reference types="cypress" />

//import { ticTacToeMachine } from "../../src/machine";
import { createModel } from "@xstate/test";

import { createMachine, assign } from 'xstate';

const evaluateWin = (ctx) => {
  const { board } = ctx;
  const winningLines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  for (let line of winningLines) {
    const xWon = line.every(index => {
      return board[index] === 'x';
    });

    if (xWon) {
      return true;
    }

    const oWon = line.every(index => {
      return board[index] === 'o';
    });

    if (oWon) {
      return true;
    }
  }
  return false;
};

const isValidMove = (ctx, event) => {
  return ctx.board[event.value] === null;
};

const evaluateDraw = (ctx) => !ctx.board.includes(null);

const updateBoard = assign({
  board: (context, event) => {
    const updatedBoard = [...context.board];
    updatedBoard[event.value] = context.whosPlaying;

    return updatedBoard;
  },
  whosPlaying: context => (context.whosPlaying === 'x' ? 'o' : 'x')
});

const setWinner = assign({
  lastWinner: context => (context.whosPlaying === 'x' ? 'o' : 'x')
});

const updateScore = assign({
  score: (context) => {
    const { lastWinner } = context;

    if(lastWinner === 'o') {
      return {
        ...context.score,
        o: ++context.score.o
      }
    } else {
      return {
        ...context.score,
        x: ++context.score.x
      }
    }
  }
});

const resetBoard = assign({
  board: () => Array(9).fill(null),
  lastWinner: () => null
});

const resetScore = assign({
  score: () => ({
    x: 0,
    o: 0
  })
});

const ticTacToeMachine = createMachine({
  id: 'ticTacToe',
  initial: 'onGame',
  context: {
    score: {
      x: 0,
      o: 0
    },
    whosPlaying: 'x', // Values X or O
    lastWinner: null,
    board: Array(9).fill(null)
  },
  states: {
    onGame: {
      on: {
        '': [
          { target: 'win', cond: 'evaluateWin', actions: 'setWinner' },
          { target: 'draw', cond: 'evaluateDraw' }
        ],
        ON_CLICK: [
          {
            target: 'onGame',
            cond: 'isValidMove',
            actions: 'updateBoard'
          }
        ],
        RESET_SCORE: [{
          actions: 'resetScore'
        }]
      },
      meta: {
        test: function () {
          cy.get(".modal").should("not.exist");
        },
      }
    },
    win: {
      type: 'final',
      /*exit: ['updateScore'],
      meta: {
        test: function () {
          cy.get(".modal-title").should("not.have.value", "Win");
        }
      }*/
    },
    draw: { 
      type: 'final',
      /*meta: {
        test: function () {
          cy.get(".modal-title").should("have.value", "Draw");
        }
      }*/
    }
  },
  on:{
    RESET: {
      type: 'final',
      /*actions: [
        'resetBoard'
      ],
     target: 'onGame'*/
    }
  }
},
{
  guards: {
    evaluateWin,
    evaluateDraw,
    isValidMove
  },
  actions: {
    updateScore,
    resetBoard,
    resetScore,
    updateBoard,
    setWinner
  }
});

const testModel = createModel(ticTacToeMachine, {
  events: {
    ON_CLICK: {
      exec: (ctx, event) => {
        cy.get('.remove-top-border.remove-left-border > img').click();
      },
      cases: Array(9)
      .fill(null)
      .map((_, i) => ({value: i})),
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
  `http://localhost:${process.env.PORT || "3000"}`
);

context("Tic Tac Toe App", () => {
  const testPlans = testModel.getShortestPathPlans({//getSimplePathPlans({
    filter: (state) => state.context.score.x <2 && state.context.score.o <2
  });
  testPlans.forEach((plan) => {
    describe(plan.description, () => {
      plan.paths.forEach(itTests);
    });
  });
});
