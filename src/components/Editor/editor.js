import React, { useEffect, useState } from "react";
import "./editor.css";
import Cursor from "./cursor";
import Header from "./header";
import GameOverComponent from "./gameOver";
import { withRouter } from "react-router";
import axios from "axios";
import { baseURI, port } from "../../config";

// TODO: Improve this cursor to be like that of Google DOCS
// also this needs a popping animation resembling to VIM

class Editor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      idx: 0,
      size: 0,
      code: "",
      title: "",
      pause: false,
      delete: false,
      totalTyped: 0,
      username: "",
      description: "",
      language: "",
      pressedKey: "",
      gameOver: false, // change this to false
      incorrect: false,
      incorrectSpanIdx: null,
      incorrectLetters: "",
      correctLetters: [],
      allIncorrect: [],
    };
    this.codeRef = React.createRef();
    this.textInput = React.createRef();
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handlePauseClick = this.handlePauseClick.bind(this);
    this.handleUnpauseClick = this.handleUnpauseClick.bind(this);
  }

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown);
    if (this.codeRef.current !== null)
      // get rid of this
      this.codeRef.current.addEventListener("click", this.handleClick);
    const id = this.props.match.params.lessonTitle;
    const pathName = this.props.match.url.split("/");
    const idx = pathName.findIndex((token) => token == "users");
    const user = pathName[idx + 1];
    this.setState({ username: user });
    axios({
      method: "GET",
      url: `${baseURI}:${port}/users/${user}/lesson/${id}`,
    })
      .then((res) => res.data)
      .then((res) => {
        this.setState({
          code: res.code,
          size: [...res.code].length > 600 ? 600 : [...res.code].length,
          title: res.title,
          language: res.language,
          description: res.description,
        });
      })
      .catch((err) => console.log(err));
  }

  handleClick(evt) {
    this.codeRef.current.focus();
    this.codeRef.current.addEventListener("keypress", this.handleKeyDown);
  }

  handleKeyDown(e) {
    let activeKey, ele;
    if (!this.state.gameOver && this.state.idx != null) {
      activeKey = e.key;
      const element = document.getElementById(this.state.idx);
      if (element != null) ele = element.innerText;
    }
    // Keep focus on document after hitting tab, extra +1 for cursor to move 2 step
    if (e.keyCode == 9 && e.shiftKey == false) {
      e.preventDefault();
      const tabbedChr = document.getElementById(this.state.idx)?.innerText;
      const tabbedChrCode = tabbedChr?.charCodeAt(tabbedChr.length - 1);
      if (tabbedChrCode == 32) {
        this.setState({
          idx: this.state.idx + 2,
        });
      }
    }
    // GAME OVER: When cursor reaches last character
    if (this.state.idx >= this.state.size - 1 && !this.state.incorrect) {
      this.setState({ gameOver: true });
    }

    if (!this.state.gameOver) {
      // on hitting backspace move cursor back
      if (activeKey == "Backspace") {
        if (this.state.idx > 0) {
          this.setState({
            idx: this.state.idx - 1,
            pressedKey: activeKey,
            totalTyped: this.state.totalTyped + 1,
            delete: true,
          });
        }
      } else if (activeKey != "Shift" && activeKey != "Tab") {
        // on hitting anything else other than shift, move cursor forward
        this.setState({
          idx: this.state.idx + 1,
          pressedKey: activeKey,
          totalTyped: this.state.totalTyped + 1,
          delete: false,
        });
      }
    }
    // if user hits backspace and comes back to wrong pos, make it right
    if (
      this.state.incorrect &&
      this.state.incorrectSpanIdx != null &&
      this.state.incorrectLetters.length > 0 &&
      this.state.incorrectSpanIdx == this.state.idx
    ) {
      this.setState({
        incorrect: false,
        incorrectSpanIdx: null,
        incorrectLetters: "",
      });
    }
    // Correct and Incorrect Mechanism
    if (
      activeKey != "Backspace" &&
      activeKey != "Shift" &&
      activeKey != "Enter" &&
      activeKey != "Tab"
    ) {
      // check for incorrect
      if (
        ele != activeKey &&
        !this.state.incorrect &&
        this.state.incorrectSpanIdx == null &&
        this.state.incorrectLetters == ""
      ) {
        this.setState({
          incorrect: true,
          incorrectSpanIdx: this.state.idx - 1,
          incorrectLetters: activeKey,
          allIncorrect: [...this.state.allIncorrect, ele],
        });
      } else {
        this.setState({
          correctLetters: [...this.state.correctLetters, activeKey],
        });
      }
    }
  }

  handlePauseClick() {
    if (this.state.pause) {
      this.setState({ pause: !this.state.pause });
    }
  }

  handleUnpauseClick() {
    if (!this.state.pause) {
      this.setState({ pause: !this.state.pause });
    }
  }

  render() {
    return (
      <div className="code-container" onClick={this.handleUnpauseClick}>
        <Header
          language={this.state.language}
          description={this.state.description}
          totalTyped={this.state.totalTyped}
          pause={this.props.pause}
          title={this.state.title}
          gameOver={this.state.gameOver}
        />
        {!this.state.gameOver && (
          <pre onClick={this.handlePauseClick} style={styles.codeArea}>
            <code ref={this.codeRef} className={"python"}>
              {[...this.state.code].map((chr, idx) => {
                // give certain classnames for different entities
                const chrCode = chr.charCodeAt(chr.length - 1);
                if (idx < 600) {
                  if (idx == this.state.idx) {
                    // render component for Enter
                    if (chrCode == 10) {
                      return (
                        <Cursor
                          key={idx}
                          class={"return"}
                          activeKey={idx}
                          children={`↵ ${chr}`}
                        />
                      );
                    }
                    // render component for current cursor position
                    if (!this.state.incorrect) {
                      return (
                        <Cursor
                          key={idx}
                          class={`active`}
                          activeKey={idx}
                          children={chr}
                        />
                      );
                    } else {
                      return (
                        <Cursor
                          key={idx}
                          class={`active-arrow`}
                          activeKey={idx}
                          children={"<="}
                        />
                      );
                    }
                  } else {
                    // render component for all other char except cursor
                    if (this.state.idx >= idx) {
                      if (
                        this.state.incorrect &&
                        idx == this.state.incorrectSpanIdx
                      ) {
                        return (
                          <Cursor
                            key={idx}
                            class={`incorrect`}
                            activeKey={idx}
                            children={chr}
                          />
                        );
                      } else {
                        return (
                          <Cursor
                            key={idx}
                            class={`done`}
                            activeKey={idx}
                            children={chr}
                          />
                        );
                      }
                    } else {
                      return (
                        <Cursor key={idx} activeKey={idx} children={chr} />
                      );
                    }
                  }
                }
              })}
            </code>
          </pre>
        )}
        {this.state.gameOver && (
          <GameOverComponent
            id={this.props.match.params.lessonTitle}
            totalTyped={this.state.totalTyped}
            correctKeys={this.state.correctLetters}
            incorrectKeys={this.state.allIncorrect}
            totalLengthCode={this.state.size}
            username={this.state.username}
          />
        )}
      </div>
    );
  }
}

const styles = {
  codeArea: {
    background: "#2e2d2c",
    color: "white",
    fontWeight: "bold",
    paddingLeft: "20px",
    paddingTop: "10px",
    minHeight: "500px",
  },
};

export default withRouter(Editor);
