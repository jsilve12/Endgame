import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from "prop-types";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Grid from '@material-ui/core/Grid';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Modal from '@material-ui/core/Modal';
import { makeStyles } from '@material-ui/core/styles';
import Chessboard from "chessboardjsx";
import Chess from "chess.js";

function convert(i) {
  return [Math.floor(i/8), i%8]
}

function ply(src, dest, squares, promotion, check) {
  /*Get the Algebraic notation for the move

  src(int): The source square
  dest(int): The destination square
  squares(array): A deep copy of the squares
  promotion(string): If a promotion is occuring
  check(string): If the move gives a check
  */
  // Starting square
  const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
  var ply = '';
  if(squares[src].pieceName()) {
    ply += squares[src].pieceName();
  }

  // Castling
  if(squares[src].pieceName() === 'K') {
    if(src - dest === 2) {
      return 'O-O-O';
    }
    else if (dest - src === 2) {
      return 'O-O';
    }
  }

  // If there's a capture
  if(squares[dest] || (squares[src].pieceName() === '' && (src%8 !== dest%8))) {
    if(!squares[src].pieceName()) {
      src = convert(src);
      ply += letters[src[1]];
    }
    ply += 'x';
  }
  dest = convert(dest)
  ply += letters[dest[1]]
  ply += Math.abs(8-dest[0]).toString();
  ply += promotion;
  ply += check;
  return ply;
}

class Sheet extends React.Component {
  render() {
    const list = [];
    for(let i = 0; i < this.props.moves.length; i+=2) {
      list.push(
        <ListItem>
          <ListItemText>
            <span className='move'>{i/2 + 1}</span> <Button>{this.props.moves[i].san}</Button><Button>{this.props.moves[i+1] && (this.props.moves[i+1].san)}</Button>
          </ListItemText>
        </ListItem>
      );
    }
    return (
      <Paper style={{height: 500, width: '100%', backgroundColor: 'lightGray', padding: '5%'}}>
        <Paper evelation={2} style={{overflow: 'auto', height: '90%'}}>
          <List style={{maxHeight: '100%', overflow: 'auto'}} >
            {list}
          </List>
        </Paper>
        <Paper evelation={2} style={{marginTop: '1%', height: '10%'}}>
          <div>
            <Button style={{width: '50%'}}>{this.props.result}</Button>
            <Button style={{width: '50%'}} onClick={this.props.reset}>Next</Button>
          </div>
        </Paper>
      </Paper>
    )
  }
}

class Game extends React.Component {
  static propTypes = { children: PropTypes.func};
  constructor(props) {
    super(props);
    this.state = {
      fen: '',
      dropSquareStyle: {},
      squareStyles: {},
      pieceSquare: "",
      square: "",
      history: [],
      move: 1,
      modal: false,
      status: '',
      turn: 'white',
      player: 1,
      sourceSelection: -1,
    };
  }

  componentDidMount() {
    this.game = new Chess();
    fetch('/api/chess/random', { method: 'GET', credentials: 'same-origin'})
    .then(response => response.json())
    .then(data => {
      fetch('http://tablebase.lichess.ovh/standard?fen=' + data.replaceAll(' ', '_'))
      .then(response2 => response2.json())
      .then(data2 => {
        this.setState(({ history, pieceSquare }) => ({
          fen: data,
          result: data2.wdl
        }));
      })
      this.game = new Chess(data);
    })
  }

  removeHighlightSquare = () => {
    this.setState(({ pieceSquare, history }) => ({
      squareStyles: squareStyling({ pieceSquare, history })
    }));
  };

  highlightSquare = (sourceSquare, squaresToHighlight) => {
    const highlightStyles = [sourceSquare, ...squaresToHighlight].reduce(
      (a, c) => {
        return {
          ...a,
          ...{
            [c]: {
              background:
                "radial-gradient(circle, #fffc00 36%, transparent 40%)",
              borderRadius: "50%"
            }
          },
          ...squareStyling({
            history: this.state.history,
            pieceSquare: this.state.pieceSquare
          })
        };
      },
      {}
    );

    this.setState(({ squareStyles }) => ({
      squareStyles: { ...squareStyles, ...highlightStyles }
    }));
  };

  onDrop = ({ sourceSquare, targetSquare }) => {
    // see if the move is legal
    let move = this.game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q" // always promote to a queen for example simplicity
    });

    // illegal move
    if (move === null) return;
    this.setState(({ history, pieceSquare }) => ({
      fen: this.game.fen(),
      history: this.game.history({ verbose: true }),
      squareStyles: squareStyling({ pieceSquare, history })
    }));

    // Get move from tablebase
    fetch('http://tablebase.lichess.ovh/standard?fen=' + this.game.fen().replaceAll(' ', '_'))
    .then(response => response.json())
    .then(data => {
      if(data.checkmate || data.stalemate || data.insufficient_material) {
        this.reset();
      }
      let move = this.game.move({
        from: data.moves[0].uci.substring(0,2),
        to: data.moves[0].uci.substring(2),
        promotion: 'q'
      });

      this.setState(({ history, pieceSquare }) => ({
        fen: this.game.fen(),
        history: this.game.history({ verbose: true }),
        squareStyles: squareStyling({ pieceSquare, history }),
        result: data.wdl*(-1)
      }));
    })
  };

  onMouseOverSquare = square => {
    // get list of possible moves for this square
    let moves = this.game.moves({
      square: square,
      verbose: true
    });

    // exit if there are no moves available for this square
    if (moves.length === 0) return;

    let squaresToHighlight = [];
    for (var i = 0; i < moves.length; i++) {
      squaresToHighlight.push(moves[i].to);
    }

    this.highlightSquare(square, squaresToHighlight);
  };

  onMouseOutSquare = square => this.removeHighlightSquare(square);

  onSquareClick = square => {
    this.setState(({ history }) => ({
      squareStyles: squareStyling({ pieceSquare: square, history }),
      pieceSquare: square
    }));

    let move = this.game.move({
      from: this.state.pieceSquare,
      to: square,
      promotion: "q" // always promote to a queen for example simplicity
    });

    // illegal move
    if (move === null) return;

    this.setState({
      fen: this.game.fen(),
      history: this.game.history({ verbose: true }),
      pieceSquare: ""
    });
  };

  onSquareRightClick = square => {
    this.setState({
      squareStyles: { [square]: { backgroundColor: "deepPink" } }
    });
  }

  reset = () => {
    fetch('/api/chess/random', { method: 'GET', credentials: 'same-origin'})
    .then(response => response.json())
    .then(data => {
      this.game = new Chess(data);
      fetch('http://tablebase.lichess.ovh/standard?fen=' + data.replaceAll(' ', '_'))
      .then(response2 => response2.json())
      .then(data2 => {
        this.setState({
          fen: data,
          dropSquareStyle: {},
          squareStyles: {},
          pieceSquare: "",
          square: "",
          history: [],
          move: 1,
          modal: false,
          status: '',
          turn: 'white',
          player: 1,
          sourceSelection: -1,
          result: data2.wdl
        });
      })
    })
  }

  render() {
    const { fen, dropSquareStyle, squareStyles, history } = this.state;
    return this.props.children({
      squareStyles,
      position: fen,
      onMouseOverSquare: this.onMouseOverSquare,
      onMouseOutSquare: this.onMouseOutSquare,
      onDrop: this.onDrop,
      dropSquareStyle,
      onDragOverSquare: this.onDragOverSquare,
      onSquareClick: this.onSquareClick,
      onSquareRightClick: this.onSquareRightClick,
      history: history,
      reset: this.reset,
      result: this.state.result,
    });
  }
}

export default function WithMoveValidation() {
  return (
    <div>
      <Game>
        {({
          position,
          onDrop,
          onMouseOverSquare,
          onMouseOutSquare,
          squareStyles,
          dropSquareStyle,
          onDragOverSquare,
          onSquareClick,
          onSquareRightClick,
          history,
          reset,
          result
        }) => (
        <Grid container style={{maxWidth: 1.035*(Math.min(window.innerWidth*(1/3), 256) + Math.min(window.innerWidth*(2/3), window.innerHeight*0.75))}}>
          <Grid item xs={8}>
            <Chessboard
              id="humanVsHuman"
              width={(Math.min(window.innerWidth*(2/3), window.innerHeight*0.75))}
              position={position}
              onDrop={onDrop}
              onMouseOverSquare={onMouseOverSquare}
              onMouseOutSquare={onMouseOutSquare}
              boardStyle={{
                borderRadius: "5px",
                boxShadow: `0 5px 15px rgba(0, 0, 0, 0.5)`
              }}
              squareStyles={squareStyles}
              dropSquareStyle={dropSquareStyle}
              onDragOverSquare={onDragOverSquare}
              onSquareClick={onSquareClick}
              onSquareRightClick={onSquareRightClick}
            />
          </Grid>
          <Grid item xs={4} style={{maxWidth: Math.min(window.innerWidth*(1/3), 256)}}>
            <Sheet moves = {history} reset = {reset} result = {result} />
          </Grid>
        </Grid>
        )}
      </Game>
    </div>
  );
}

const squareStyling = ({ pieceSquare, history }) => {
  const sourceSquare = history.length && history[history.length - 1].from;
  const targetSquare = history.length && history[history.length - 1].to;

  return {
    [pieceSquare]: { backgroundColor: "rgba(255, 255, 0, 0.4)" },
    ...(history.length && {
      [sourceSquare]: {
        backgroundColor: "rgba(255, 255, 0, 0.4)"
      }
    }),
    ...(history.length && {
      [targetSquare]: {
        backgroundColor: "rgba(255, 255, 0, 0.4)"
      }
    })
  };
};

const Chesses = document.getElementById('chess');
if (Chesses)
{
  ReactDOM.render(
    <WithMoveValidation/>, Chesses
  );
}
