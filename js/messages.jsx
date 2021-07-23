import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';

class Messages extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      Messages: {},
    };
  }

  componentDidMount() {
    fetch('/api/messages/ongoing', { method: 'GET', credentials: 'same-origin' })
    .then(response => response.json())
    .then(data => {
      this.setState({ Messages: data });
    });
  }

  render() {
    return (
      <div></div>
    );
  }
}
