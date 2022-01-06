import { connect } from 'react-redux';
import { DISABLE_COMMENTS_TAG } from 'constants/tags';
import { selectClaimForUri, makeSelectTagInClaimOrChannelForUri, selectThumbnailForUri } from 'redux/selectors/claims';
import LivestreamLayout from './view';

const select = (state, props) => {
  return {
    chatDisabled: makeSelectTagInClaimOrChannelForUri(props.uri, DISABLE_COMMENTS_TAG)(state),
    claim: selectClaimForUri(state, props.uri),
    thumbnail: selectThumbnailForUri(state, props.uri),
  };
};

export default connect(select)(LivestreamLayout);
