'use client';

import React from 'react';
import { createPlayer } from '@videojs/react';
import { MinimalVideoSkin, Video, videoFeatures } from '@videojs/react/video';
import '@videojs/react/video/minimal-skin.css';

const Player = createPlayer({ features: videoFeatures });

interface VideoPlayerProps {
  src: string;
  poster?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, poster }) => {
  return (
    <Player.Provider>
      <MinimalVideoSkin>
        <Video src={src} playsInline />
      </MinimalVideoSkin>
    </Player.Provider>
  );
};

export default VideoPlayer;