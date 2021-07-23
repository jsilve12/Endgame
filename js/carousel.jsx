import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';

class Carousel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      Images: [],
    };
  }

  render() {
    <div id="myCarousel" class="carousel slide" data-ride='carousel'>
      <ol class="carousel-indicators">
        <li class="active" data-target='#myCarousel' data-slide-to='0'></li>
        <li data-target='#myCarousel' data-slide-to='1'></li>
        <li data-target='#myCarousel' data-slide-to='2'></li>
      </ol>
      <div class="carousel-inner">
        <div class="carousel-item carousel-image-1 active">
          <div class="container">
            <div class="michigan-colors carousel-caption d-none d-sm-block text-right mb-5">
            </div>
          </div>
        </div>
        <div class="carousel-item carousel-image-2">
          <div class="container">
            <div class="carousel-caption d-none d-sm-block text-right mb-5">
            </div>
          </div>
        </div>
        <div class="carousel-item carousel-image-3">
          <div class="container">
            <div class="carousel-caption d-none d-sm-block text-right mb-5">
            </div>
          </div>
        </div>
      </div>
    </div>;
  }
}
Carousel.propTypes = {};
const Caro = document.getElementById('carousel');
if (Caro)
{
  ReactDOM.render(
    <Carousel/>, Caro
  );
}
