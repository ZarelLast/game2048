import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";

class App extends React.Component {
  state = {
    Score: 0,
    BestScore: 0,
    array: [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
    status: " "
  };

  componentDidMount = () => {
    this.setup();
    document.addEventListener("keydown", this.handleKeyPress);
  };

  componentWillUnmount = () => {
    document.removeEventListener("keydown", this.handleKeyPress);
  };

  isGameOver = () => {
    let gameover = true;
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (this.state.array[i][j] == 0) {
          return false;
        }
        if (i !== 3 && this.state.array[i][j] === this.state.array[i + 1][j]) {
          return false;
        }
        if (j !== 3 && this.state.array[i][j] === this.state.array[i][j + 1]) {
          return false;
        }
      }
    }
    return true;
  };
  setup = event => {
    var canvas = document.getElementById("myCanvas");
    var ctx = canvas.getContext("2d");
    this.drawCanvas(canvas);
    this.addNumber(this.state.array);
    this.addNumber(this.state.array);
    this.updateCanvas(ctx, this.state.array);

    let gameover = this.isGameOver();
      if (gameover) {
        console.log("Game Over");
      }
  };

  drawCanvas = canvas => {
    canvas.width = 400;
    canvas.height = 400;
  };

  updateCanvas = (ctx, grid) => {
    this.drawGrid(ctx, grid);
  };

  drawGrid = (ctx, grid) => {
    let w = 100;
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        ctx.beginPath();
        ctx.rect(i * w, j * w, w, w);
        ctx.fillStyle = "#e0e0e0";
        ctx.strokeStyle = "#000";
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
        let val = grid[i][j];
        if (grid[i][j] !== 0) {
          ctx.textAlign = "center";
          ctx.fillStyle = "#000";
          ctx.font = "50px Comic Sans MS";
          ctx.fillText(val, i * w + w / 2, (j + 1) * w - w / 3);
        }
      }
    }
  };

  addNumber = grid => {
    let options = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (grid[i][j] === 0) {
          options.push({
            x: i,
            y: j
          });
        }
      }
    }
    if (options.length > 0) {
      let spot = options[Math.floor(Math.random() * options.length)];
      let r = Math.random(1);
      grid[spot.x][spot.y] = r > 0.5 ? 2 : 4;
    }
  };

  slide = row => {
    let arr = row.filter(val => val);
    let missing = 4 - arr.length;
    let zeros = Array(missing).fill(0);
    arr = zeros.concat(arr);
    return arr;
  };

  combine = row => {
    for (let i = 3; i >= 1; i--) {
      let a = row[i];
      let b = row[i - 1];
      if (a == b) {
        row[i] = a + b;
        this.setState({
          Score: this.state.Score + row[i]
        });
        row[i - 1] = 0;
      }
    }
    return row;
  };

  copyArray = grid => {
    let past = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        past[i][j] = grid[i][j];
      }
    }
    return past;
  };

  compareGrid = (a, b) => {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (a[i][j] !== b[i][j]) {
          return true;
        }
      }
    }
    return false;
  };

  flipGrid = grid => {
    for (let i = 0; i < 4; i++) {
      grid[i].reverse();
    }
  };

  rotateGrid = grid => {
    let newGrid = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        newGrid[i][j] = grid[j][i];
      }
    }
    return newGrid;
  };

  handleKeyPress = event => {
    let flipped = false;
    let rotated = false;
    let played = true;
    var canvas = document.getElementById("myCanvas");
    var ctx = canvas.getContext("2d");

    if (event.keyCode === 40) {
      // Do Nothing
    } else if (event.keyCode === 38) {
      this.flipGrid(this.state.array);
      flipped = true;
    } else if (event.keyCode === 39) {
      this.setState({ array: this.rotateGrid(this.state.array) });
      rotated = true;
    } else if (event.keyCode === 37) {
      this.setState({ array: this.rotateGrid(this.state.array) });
      this.flipGrid(this.state.array);
      rotated = true;
      flipped = true;
    } else {
      played = false;
    }

    if (played) {
      let past = this.copyArray(this.state.array);
      for (let i = 0; i < 4; i++) {
        this.state.array[i] = this.operate(this.state.array[i]);
      }

      let changed = this.compareGrid(past, this.state.array);

      if (flipped) {
        this.flipGrid(this.state.array);
      }

      if (rotated) {
        this.setState({ array: this.rotateGrid(this.state.array) });
        this.setState({ array: this.rotateGrid(this.state.array) });
        this.setState({ array: this.rotateGrid(this.state.array) });
      }

      if (changed) {
        this.addNumber(this.state.array);
      }
      
      this.updateCanvas(ctx, this.state.array);
      
      let gameover = this.isGameOver();
      if (gameover) {
        this.setState({
          status: "GAME OVER"
        });
      }
    }
  };

  operate = row => {
    row = this.slide(row);
    row = this.combine(row);
    row = this.slide(row);
    return row;
  };

  saveData = e => {
    e.preventDefault();
    var score = parseInt(e.target.value);
    this.setState({ Score: score });
    localStorage.setItem("Score", score);
    if (score >= this.state.BestScore) {
      this.setState({ BestScore: score });
      localStorage.setItem("Best Score", score);
    }
  };
  render() {
    return (
      <div>
        <div className="row">
          <div>
            <h5>Score</h5>
            <h1>{this.state.Score}</h1>
          </div>
          <div>
            <h5>Best Score</h5>
            <h1>{this.state.BestScore}</h1>
          </div>
        </div>
        <button onClick={this.keyPressed}>coba</button>
        <canvas id="myCanvas"></canvas>
        <h1>{this.state.status}</h1>
      </div>
    );
  }
}

export default App;
