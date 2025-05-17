'use client';
import React from 'react';

const FullPageLoader = () => {
  return (
    <div className="retailored-loader">
      <div className="retailored-loader-content">
        <div className="squares-animation">
          <span className="square"></span>
          <span className="square"></span>
          <span className="square"></span>
        </div>
        <div className="retailored-text">Please wait<span className="ellipsis">...</span></div>
        </div>
    </div>
  );
};

export default FullPageLoader;
