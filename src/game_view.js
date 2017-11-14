const Game = require("./game");
const Index = require("./index");
const SourceNode = require("./source_node");
const SubNode = require("./sub_node");
const DragLine = require("./drag_line");
const PowerBall = require("./power_ball");
const SinkNode = require("./sink_node");

class GameView {
  constructor(game, ctx) {
    this.ctx = ctx;
    this.game = game;
    this.interval = 0;
    this.interval2 = 0;
    this.newGame = true;
    this.sourceNodes = [];
    this.subNodes = [];
    this.lines = [];
    this.lineQueue = [];
    this.subNodeBalls = [];
    this.gameOver = false;
    this.sinkNodes = [];
    this.paused = false;
    this.dragLine = null;
    this.count = 0;
    this.score = 0;
    this.skipMouseMove = false;
    this.canvas = document.getElementById("canvas");
    this.registerEventListener = this.registerEventListener.bind(this);
    this.registerEventListener();
  }

  start() {
    this.lastTime = 0;
    requestAnimationFrame(this.animate.bind(this));
  }

  registerEventListener() {
    let self = this;
    this.canvas.addEventListener('mousedown', function() {
        let allNodes = self.sourceNodes.concat(self.subNodes);
        for (let i = 0; i < allNodes.length; i++) {
          self.userInput(event.offsetX, event.offsetY, allNodes[i]);
        }
    });

    document.addEventListener('keydown', function(e) {
      if (e.keyCode === 80 && self.paused === false) {
        self.paused = true;
      } else if (e.keyCode === 80 && self.paused === true) {
        self.paused = false;
        requestAnimationFrame(self.animate.bind(self));
      }
    });
  }

  deleteNode(xCord, yCord) {
    let newSubs = [];
    let newSources = [];
    let mutableNodes = this.subNodes.concat(this.sourceNodes);
    for (let i = 0; i < mutableNodes.length; i++) {
      if (!(this.inRange(xCord, yCord, mutableNodes[i]))) {
        for (let j = 0; j < mutableNodes[i].lines.length; j++) {
          if (xCord >= mutableNodes[i].lines[j].destinationNode.xRange[0] &&
              xCord <= mutableNodes[i].lines[j].destinationNode.xRange[1] &&
              yCord >= mutableNodes[i].lines[j].destinationNode.yRange[0] &&
              yCord <= mutableNodes[i].lines[j].destinationNode.yRange[1]) {
            mutableNodes[i].deleteLine(j);
          }
        }
        if (mutableNodes[i] instanceof SourceNode) {
          newSources.push(mutableNodes[i]);
        } else {
          newSubs.push(mutableNodes[i]);
        }
      }
    }
    this.skipMouseMove = false;
    this.sourceNodes = newSources;
    this.subNodes = newSubs;
  }

  onSameChain(src, end) {
    let queue = [src];
    while (queue.length > 0) {
      let currentNode = queue.shift();
      if (currentNode === end) {
        return true;
      }
      currentNode.lines.forEach(function(line){
        queue.push(line.destinationNode);
      });
    }
    return false;
  }

  inRange(xCord, yCord, node) {
    return (xCord >= node.xRange[0] && xCord <= node.xRange[1] &&
      yCord >= node.yRange[0] && yCord <= node.yRange[1]);
  }

  getNodeFromCoords(x, y) {
    let allNodes = this.sourceNodes.concat(this.subNodes).concat(this.sinkNodes);
    for (let i = 0; i < allNodes.length; i++) {
      if (this.inRange(x, y, allNodes[i])) {
        return allNodes[i];
      }
    }
    return null;
  }

  pointsToPreviousNode(node, destNode) {
    for (let i = 0; i < node.associated.length; i++) {
      if (node.associated[i] === destNode) {
        return true;
      }
    }
    return false;
  }

  userInput(xCord, yCord, node) {
    let self = this;
    if (this.inRange(xCord, yCord, node)) {
        let addVal = node.val;

        self.canvas.addEventListener('mousemove', function handler(e) {
          let xCordMove = event.offsetX;
          let yCordMove = event.offsetY;
          if (self.skipMouseMove) {
            self.skipMouseMove = false;
            e.currentTarget.removeEventListener(e.type, handler);
          }
          self.dragLine = new DragLine(xCord, yCord, xCordMove, yCordMove, node);
          self.canvas.addEventListener('mouseup', function handler2(e2) {
            e2.currentTarget.removeEventListener(e2.type, handler2);
            e2.currentTarget.removeEventListener(e.type, handler);
          });
        });
        self.canvas.addEventListener('mouseup', function handler(e) {
          e.currentTarget.removeEventListener(e.type, handler);
          const xCordUp = event.offsetX;
          const yCordUp = event.offsetY;
          if (xCord === xCordUp && yCord === yCordUp) {
            self.deleteNode(xCord, yCord);
            self.skipMouseMove = true;
            e.currentTarget.removeEventListener(e.type, handler);
            self.dragLine = null;
            return;
          }
          let destNode = self.getNodeFromCoords(xCordUp, yCordUp);

          let addUp = false;
          let sameChain = false;
          let pointsToPrevious = false;
          const powerBall = new PowerBall(self.dragLine, node);
          self.dragLine.balls.push(powerBall);
          self.dragLine.defaultBall = new PowerBall(self.dragLine, node);
          self.dragLine.startNode = node;

          let toSinkNode = false;
          if (self.pointsToPreviousNode(node, destNode)) {
            pointsToPrevious = true;
            addUp = false;
          } else if (destNode instanceof SubNode) {
            if (self.onSameChain(destNode, node)) {
              sameChain = true;
              self.dragLine = null;
            } else {
              destNode.val += addVal;
              self.dragLine.balls[self.dragLine.balls.length - 1].destinationNode = destNode;
              self.dragLine.defaultBall.destinationNode = destNode;
              self.dragLine.destinationNode = destNode;
              destNode.updateAddedValues(node.uniqId);
              node.associated.push(destNode);
              node.addLines(self.dragLine);

              let currentCheckNode = [destNode];
              let currentSum = destNode.val;
              while (currentCheckNode.length > 0) {
                let currentNode = currentCheckNode.shift();
                currentNode.lines.forEach(function(line) {
                    if (line.destinationNode instanceof SubNode) {
                      line.destinationNode.val += addVal;
                      currentCheckNode.push(line.destinationNode);
                    }
                });
              }
              addUp = true;
            }
          } else if (destNode instanceof SinkNode) {
            if (destNode.val === addVal) {
              self.dragLine.balls[self.dragLine.balls.length - 1].destinationNode = destNode;
              self.dragLine.defaultBall.destinationNode = destNode;
              self.dragLine.destinationNode = destNode;
              node.associated.push(destNode);
              node.addLines(self.dragLine);
              toSinkNode = true;
            }
          } else if (destNode instanceof SourceNode) {
            addUp = false;
          } else if (!addUp && !toSinkNode && !sameChain && !pointsToPrevious) {
            let newNode = new SubNode(xCordUp, yCordUp, self.ctx, addVal, node.uniqId);
            self.subNodes.push(newNode);
            self.dragLine.balls[self.dragLine.balls.length - 1].destinationNode = newNode;
            self.dragLine.defaultBall.destinationNode = newNode;
            self.dragLine.destinationNode = newNode;
            node.associated.push(newNode);
            node.addLines(self.dragLine);
          } else {
            addUp = false;
          }
          self.dragLine = null;
        });
      }
  }

  combineAllNodes() {
    return this.sourceNodes.concat(this.subNodes).concat(this.sinkNodes);
  }

  drawBallsFromLine(line, node) {
    let self = this;
    let ballIdx = 0;
    const newBallStore = [];

    while (ballIdx < line.balls.length) {
      let ball = line.balls[0];
      ball.draw(self.ctx);
      ball.updatePosition();
      if (ball.reachedDestination() && ball.destinationNode instanceof SinkNode) {
        ball.destinationNode.currentTally += 1;
        ball.destinationNode.degrees = 360;
      } else if (ball.reachedDestination()) {
        ball.destinationNode.updateAddedValues(ball.associatedNode.uniqId);
      } else {
        if (!ball.destinationNode instanceof SinkNode) {
          ball.destinationNode.setAddedValues(ball.associatedNode.uniqId);
        }
        newBallStore.push(ball);
      }
      ballIdx += 1;
    }
    line.balls = newBallStore;
  }

  animate(time) {
    if (this.interval2 === 100) {
      this.score += 1;
      this.interval2 = 0;
    }
    if (this.paused === false && this.gameOver === false) {
      let self = this;
      let newStore = [];
      const timeDelta = time - this.lastTime;
      this.ctx.clearRect(0, 0, Game.DIM_X, Game.DIM_Y);
      if (this.dragLine !== null) {
        this.dragLine.draw(self.ctx);
      }
      this.sourceNodes.forEach(function(sourcenode) {
        sourcenode.updateTimeAlive();
        if (sourcenode.timeAlive > 0) {
          newStore.push(sourcenode);
        } else if (sourcenode.associated.length > 0){
          sourcenode.associated.forEach(function(subnode){
            let updateQueue = [subnode];
            let currentSubNode;
            while (updateQueue.length > 0) {
              currentSubNode = updateQueue.shift();
              if (currentSubNode instanceof SubNode) {
                currentSubNode.val -= sourcenode.val;
              }
              currentSubNode.associated.forEach(function(subnode2){
                updateQueue.push(subnode2);
              });
            }
          });
        }
        self.sourceNodes = newStore;
        sourcenode.lines.forEach(function(line) {
          line.draw(self.ctx);
        });

        if (sourcenode.countDown === 0) {
          sourcenode.countDown = 200;
          if (sourcenode.lines[sourcenode.lineIdx]) {
            let tester = new DragLine();
            tester.balls.push(new PowerBall(sourcenode.lines[sourcenode.lineIdx],
              sourcenode.lines[sourcenode.lineIdx].startNode,
              sourcenode.lines[sourcenode.lineIdx].destinationNode));
            self.lineQueue.push(tester);
          }
          sourcenode.lineIdx += 1;
          if (sourcenode.lineIdx >= sourcenode.lines.length) {
            sourcenode.lineIdx = 0;
          }
        } else {
          sourcenode.countDown -= 1;
        }
        sourcenode.drawSourceNode(self.ctx);
      });

      if (this.newGame) {
        this.sourceNodes.push(new SourceNode(this.combineAllNodes(), 4));
        this.sourceNodes.push(new SourceNode(this.combineAllNodes(), 3));
        this.sourceNodes.push(new SourceNode(this.combineAllNodes(), 1));
        this.sinkNodes.push(new SinkNode(this.combineAllNodes(), 4));
        this.sinkNodes.push(new SinkNode(this.combineAllNodes(), 5));
        this.sinkNodes.push(new SinkNode(this.combineAllNodes(), 2));
        this.newGame = false;
      }

      if (this.interval === 1000) {
        this.sourceNodes.push(new SourceNode(this.combineAllNodes()));
        this.sinkNodes.push(new SinkNode(this.combineAllNodes()));
        this.lastTime = time;
        this.interval = 0;
      } else {
        this.interval += 1;
        this.interval2 += 1;
      }
      const subNodeStore = [];
      this.subNodes.forEach(function(subnode) {
        if (subnode.val > 0) {
          if (subnode.associated.length === 0) {
            subnode.resetCounts();
          }
          subnode.lines.forEach(function(line) {
             if (subnode.isFullyPowered()) {
                if (subnode.lines[subnode.lineIdx]) {
                  let tester2 = new DragLine();
                  tester2.balls.push(new PowerBall(
                    subnode.lines[subnode.lineIdx],
                    subnode.lines[subnode.lineIdx].startNode,
                    subnode.lines[subnode.lineIdx].destinationNode));
                  self.lineQueue.push(tester2);
                }
                subnode.lineIdx += 1;
                if (subnode.lineIdx >= subnode.lines.length) {
                  subnode.lineIdx = 0;
                }
                subnode.decreaseValuesByOne();
            }

            line.draw(self.ctx);
          });
          subNodeStore.push(subnode);
          subnode.drawSubNode(self.ctx);
        }

      });
      self.subNodes = subNodeStore;
      const sinkNodeStore = [];
      this.sinkNodes.forEach(function(sinknode) {
        sinknode.updateTimeAlive();
        if (sinknode.outOfTime === true) {
          self.gameOver = true;
        }
        if (sinknode.currentTally < sinknode.finalTally) {
          sinknode.lines.forEach(function(line) {
            self.drawBallsFromLine(line);
            // line.draw(self.ctx);
          });
          sinkNodeStore.push(sinknode);
          sinknode.drawSinkNode(self.ctx);
        } else {
          self.score += 10;
          self.subNodes.forEach(function(subnode) {
            let newLines = [];
            subnode.lines.forEach(function(line) {
              if (line.destinationNode !== sinknode) {
                newLines.push(line);
              }
            });
            subnode.lines = newLines;
          });

          self.sourceNodes.forEach(function(sourcenode) {
            let newLines = [];
            sourcenode.lines.forEach(function(line) {
              if (line.destinationNode !== sinknode) {
                newLines.push(line);
              }
            });
            sourcenode.lines = newLines;
          });
        }
      });
      self.sinkNodes = sinkNodeStore;
      self.lineQueue.forEach(function(line) {
        self.drawBallsFromLine(line);
      });
      this.lastTime = time;
      this.game.drawScore(this.ctx, this.score);
      requestAnimationFrame(this.animate.bind(this));
    } else if (this.paused === true) {
      this.game.drawPausedScreen(this.ctx);
      this.ctx.globalAlpha = 1;
    } else {
      this.game.drawGameOverScreen(this.ctx);
    }
  }
}

module.exports = GameView;
