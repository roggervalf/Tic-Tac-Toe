import { Button, Table, Modal } from 'react-bootstrap';
import wrongMark from './images/wrongMark.png';
import circle from './images/circle.png';
import white from './images/white.png';
import { ticTacToeMachine } from "./machine";
import { useMachine } from "@xstate/react";
// import { inspect } from '@xstate/inspect';
import './App.css';

/*inspect({
  iframe: false
});*/

function range(length) {
  return Array(length)
    .fill(null)
    .map((_, i) => i);
}

function generateBoardBoxClassName(index){
  const classes = ["board-box"];

  if(index<3){
    classes.push('remove-top-border');
  }

  if( index>5){
    classes.push('remove-bottom-border');
  }

  if(index%3===0){
    classes.push('remove-left-border');
  }

  if(index%3===2){
    classes.push('remove-right-border');
  }

  return classes.join(' ');
}

const App = () => {
    const [current, send] = useMachine(ticTacToeMachine, {devTools:true});
    const { 
      score,
      whosPlaying,
      lastWinner,
      board
    } = current.context;
    console.log("current", current.context);
    
    const playernamex = 'No player';
    const playernameo = 'No player';
      
  return (
      <div className="d-flex flex-column table-wrapper justify-content-center align-items-center p-2">
        <div className="p-5 mb-5">
          {
            (whosPlaying === 'x') ? 
              <h3>Turn <img className="xturn" alt="" src={wrongMark} /></h3>
            :
              <h3>Turn <img className="oturn" alt="" src={circle} /></h3>
          }
        </div>

        <div className="d-flex">
          <div className="pr-5 mr-5">
            <p className="text-center">{playernamex}</p>
            <h5 className="text-center"><img className="xturn pb-1" alt="" src={wrongMark} /> Score:</h5>
            <h5 className="text-center">{score.x}</h5>
          </div>

          <div className="mr-5 ml-5 mb-5">
          <Table borderless className="w-25">
            <div className="text-center table-board">
             
              {range(9).map((i) => {
                return (
                  <div
                    key={i}
                    className = {generateBoardBoxClassName(i)}
                    onClick={() => send({ type: "ON_CLICK", whosPlaying, value: i })}
                  >
                    {
                          (board[i] === 'x') ?
                            <img src={wrongMark} alt="" />
                          :
                            (board[i] === 'o') ?
                              <img src={circle} alt="" />
                            :
                              <img src={white} alt="" />
                        }
                  </div>
                );
              })}
            </div>
          </Table>
          </div>

          <div className="ml-5 pl-5">
            <p className="text-center">{playernameo}</p>
            <h5 className="text-center pb-1"><img className="oturn" alt="" src={circle} /> Score:</h5>
            <h5 className="text-center">{score.o}</h5>
          </div>
        </div>
        

        <div className="mt-4">
          <Button size="sm" variant="warning" data-testid="reset-board" className="mr-4" onClick={() => send({ type: "RESET" })}>Reset Board</Button>
          <Button size="sm" variant="warning" data-testid="reset-score" className="mr-4" onClick={() => send('RESET_SCORE')}>Reset Score</Button>
        </div>

        <Modal show={current.matches("win") || current.matches("draw")}>
          <Modal.Header className="text-center">
            {
              (lastWinner === 'x') ?
                <Modal.Title>X Wins!</Modal.Title>
              :
                (lastWinner === 'o') ?
                  <Modal.Title>O Wins!</Modal.Title>
                :
                  <Modal.Title>Draw</Modal.Title>
            }
          </Modal.Header>
          
          <Modal.Footer className="text-center">
            <Button variant="warning" onClick={() => send('RESET')}>
              Another Round
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
      
  )
}

export default App;
