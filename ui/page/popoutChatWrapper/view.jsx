// @flow
import { lazyImport } from 'util/lazyImport';
import Page from 'component/page';
import React from 'react';

const LivestreamChatLayout = lazyImport(() => import('component/livestreamChatLayout' /* webpackChunkName: "chat" */));

type Props = {
  channelClaimId: ?string,
  claim: StreamClaim,
  isLivestream: boolean,
  uri: string,
  doCommentSocketConnect: (string) => void,
  doCommentSocketDisconnect: (string) => void,
  doFetchActiveLivestream: (string) => void,
  doResolveUri: (string) => void,
};

function PopoutChatPage(props: Props) {
  const {
    channelClaimId,
    claim,
    isLivestream,
    uri,
    doCommentSocketConnect,
    doCommentSocketDisconnect,
    doFetchActiveLivestream,
    doResolveUri,
  } = props;

  const claimId = claim && claim.claim_id;

  /* Find out current channels status + active live claim.
  React.useEffect(() => {
    if (!channelClaimId || !isLivestream) return;

    doFetchActiveLivestream(channelClaimId);
    const intervalId = setInterval(() => doFetchActiveLivestream(channelClaimId), 30000);
    return () => clearInterval(intervalId);
  }, [channelClaimId, doFetchActiveLivestream]); */

  React.useEffect(() => {
    if (!claimId) {
      doResolveUri(uri);
      console.log(uri);
    }
  }, [claimId, doResolveUri, uri]);

  React.useEffect(() => {
    if (claimId) doCommentSocketConnect(uri, claimId);

    return () => {
      if (claimId) doCommentSocketDisconnect(claimId);
    };
  }, [claimId, doCommentSocketConnect, doCommentSocketDisconnect, uri]);

  return (
    <Page noSideNavigation noFooter noHeader isPopout>
      <LivestreamChatLayout uri={uri} isPopout />
    </Page>
  );
}

export default PopoutChatPage;
