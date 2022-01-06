import { connect } from 'react-redux';
import { selectStakedLevelForChannelUri, selectClaimForUri } from 'redux/selectors/claims';
import { selectIsCommentMine } from 'redux/selectors/comments';
import LivestreamComment from './view';

const select = (state, props) => {
  const { uri, comment } = props;
  const { channel_url: authorUri, comment_id: commentId } = comment;

  return {
    claim: selectClaimForUri(state, uri),
    commentIsMine: selectIsCommentMine(state, commentId),
    stakedLevel: selectStakedLevelForChannelUri(state, authorUri),
  };
};

export default connect(select)(LivestreamComment);
