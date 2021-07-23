import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';

class Footer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  };

  render() {
    return (
      <div className='mt-5'>
        <footer className="bg-info p-1 mt-5 navbar fixed-bottom">
          <h2 className='px-3 text-light'>Boilerplate</h2>
        </footer>
      </div>
    );
  }
}
Footer.propTypes = {};
const Foot = document.getElementById('footer');
if (Foot)
{
  ReactDOM.render(
    <Footer/>, Foot
  );
}
