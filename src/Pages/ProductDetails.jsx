import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { RiReplyLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import Loader from 'react-loader-spinner';
import { getDetailedProduct, getProductDescription } from '../services/api';
import changeImageSize from '../services/changeImageSize';
import { addToStorage } from '../services/storageCartItem';
import AddToCart from '../Components/AddToCart';
import ReviewForm from '../Components/ReviewForm';
import StarsReview from '../Components/StarsReview';
import { getReviews } from '../services/storageReviews';
import checkAvailability from '../services/checkAvailability';
import '../Style/productDetails.css';

class ProductDetails extends Component {
  constructor() {
    super();

    this.state = {
      product: {},
      description: {},
      reviews: [],

      loading: true,
    };

    this.getProduct = this.getProduct.bind(this);
    this.setReviews = this.setReviews.bind(this);
    this.addToCart = this.addToCart.bind(this);
  }

  componentDidMount() {
    this.getProduct();
    this.setReviews();
  }

  async getProduct() {
    const { match: { params: { id } } } = this.props;

    const response = await getDetailedProduct(id);
    const responseDescription = await getProductDescription(id);
    this.setState({
      product: response,
      description: responseDescription,
    }, () => {
      this.setState({ loading: false });
    });
  }

  setReviews() {
    this.setState({ reviews: getReviews() });
  }

  addToCart() {
    const { updateAmount } = this.props;
    const { product: { price, thumbnail, title, id } } = this.state;
    const item = { price, thumbnail, title, id };

    addToStorage(item);
    updateAmount();
  }

  render() {
    const {
      product: { title, price, thumbnail = '', attributes = [], id: productId },
      description: { plain_text: description },
      loading,
      reviews,
    } = this.state;
    const image = changeImageSize(thumbnail, 'O');

    const loader = (
      <div className="loader">
        <Loader type="ThreeDots" color="#272727" height={ 40 } width={ 40 } />
      </div>
    );

    const attributesList = (
      attributes.map(({ value_id: id, name, value_name: info }, index) => {
        info = (info !== null && info.includes(',')) ? info.split(',').join(', ') : info;

        return (info === null) ? '' : (
          <li key={ `${id}(${index})` } className="product-specification">
            {`${name}: ${info}`}
          </li>
        );
      })
    );

    const details = (
      <div className="product-details">
        <div className="product-info">
          <div className="product-basic">
            <p
              data-testid="product-detail-name"
              className="product-name"
            >
              {title}
            </p>
            <p className="product-price">
              { `R$ ${price}` }
            </p>
            <img src={ image } alt={ title } />
            <AddToCart
              addToCart={ this.addToCart }
              idTest="product-detail-add-to-cart"
              disabledBtn={ !checkAvailability(productId) }
            />
          </div>
        </div>
        <div className="product-more">
          <div className="product-specifications">
            <p className="info-title">Especificações: </p>
            <ul>
              {attributes.length !== 0 && attributesList}
            </ul>
          </div>
          <div className="product-description">
            <p className="info-title">Descrição</p>
            <p className="description">{description}</p>
          </div>
        </div>
        <div className="reviews-container">
          <p className="reviews-title">Avaliações</p>
          <ReviewForm
            setReviews={ this.setReviews }
          />
          <div className="reviews">
            {reviews === null ? (
              <p className="no-reviews">Seja o primeiro a avaliar!</p>
            ) : (
              reviews.map(({ email, stars, comment }, index) => (
                <div key={ `review-${index}` } className="review">
                  <div className="email-stars">
                    <p>{email}</p>
                    <div><StarsReview clickable={ false } selectedStars={ stars } /></div>
                  </div>
                  <p>{comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );

    return (
      <div className="product-details-page">
        <div>
          <Link to="/">
            <RiReplyLine className="icon-backTo" color="rgb(46,46,46)" />
          </Link>
        </div>
        {loading ? loader : details}
      </div>
    );
  }
}

ProductDetails.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }),
  }).isRequired,
  updateAmount: PropTypes.func.isRequired,
};

export default ProductDetails;
