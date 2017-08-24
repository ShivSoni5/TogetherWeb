import React, { Component } from 'react';
import io from 'socket.io-client';
import '../node_modules/video-react/dist/video-react.css';
import './Video.css';
import { Player } from 'video-react';

let tempQueue = [
  'https://www.youtube.com/watch?v=PWsXQKv6UiA',
  'https://www.youtube.com/watch?v=i-GWFGwbEPg',
  'https://www.youtube.com/watch?v=Ra8San4epfY',
];

let bigPlayButton;
let smallPlayButton;
let timeBar;

const sources = {
  sintelTrailer: 'http://media.w3.org/2010/05/sintel/trailer.mp4',
  bunnyTrailer: 'http://media.w3.org/2010/05/bunny/trailer.mp4',
  bunnyMovie: 'http://media.w3.org/2010/05/bunny/movie.mp4',
  test: 'http://media.w3.org/2010/05/video/movie_300.webm',
};

class Video extends Component {
  constructor(props) {
    super(props);

    this.state = {
      source: sources['bunnyMovie'],
    };

    this.socket = io(`http://localhost:8080`);
  }
  componentDidMount() {
    this.refs.player.subscribeToStateChange(this.handleStateChange.bind(this));
    let player = this.refs.player;

    bigPlayButton = document.getElementsByClassName('video-react-big-play-button')[0];
    smallPlayButton = document.getElementsByClassName('video-react-play-control')[0];
    timeBar = document.getElementsByClassName('video-react-progress-holder')[0];

    this.socket.emit('join', {name: this.props.name, room: this.props.room});

    //sends signal to pause video
    bigPlayButton.addEventListener('click', ()=> {
      this.socket.emit('play-pause-video', this.state.player.paused);
    });
    smallPlayButton.addEventListener('click', ()=> {
      console.log(this.state.player.paused);
      this.socket.emit('play-pause-video', this.state.player.paused);
    });
    //sends signal that media has ended and source should be changed
    

    //sends signal if video time is changed
    timeBar.addEventListener('click', ()=> {
      console.log(this.state.player.currentTime);
      this.socket.emit('update-time', this.state.player.currentTime);
    });

    //receives signal to handle play/pause
    this.socket.on('play-pause-video', (curPlay)=> {
      if (!curPlay) player.play();
      else player.pause();
    });
    //receives signal to handle video time update
    this.socket.on('update-time', (curTime)=> {
      player.seek(curTime);
    });
    //receives signal to load new video from queue
    // this.socket.on('change-src', ()=> {
    //   tempQueue.shift();
    //   player.setSrc(tempQueue[0]);
    //   player.load();
    //   player.play();
    // });
  }

  handleStateChange(state, prevState) {
    // copy player state to this component's state
    this.setState({
      player: state
    });
    //console.log(state);
  }

  componentWillUnmount() {
    this.socket.disconnect();
  }

  render() {
    return (
      <div className="video-content">
        <Player ref="player">
          <source src="http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4" />
        </Player>
      </div>
    );
  }
}

export default Video;
