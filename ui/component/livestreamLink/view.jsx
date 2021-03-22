// @flow
import { BITWAVE_API } from 'constants/livestream';
import React from 'react';
import Card from 'component/common/card';
import ClaimPreview from 'component/claimPreview';
import { Lbry } from 'lbry-redux';

type Props = {
  channelClaim: ChannelClaim,
};

export default function LivestreamLink(props: Props) {
  const { channelClaim } = props;
  const [livestreamClaim, setLivestreamClaim] = React.useState(false);
  const [isLivestreaming, setIsLivestreaming] = React.useState(false);
  const livestreamChannelId = channelClaim.claim_id || ''; // TODO: fail in a safer way, probably

  React.useEffect(() => {
    Lbry.claim_search({
      channel_ids: [livestreamChannelId],
      has_no_source: true,
      claim_type: ['stream'],
    })
      .then((res) => {
        if (res && res.items && res.items.length > 0) {
          const claim = res.items[res.items.length - 1];
          setLivestreamClaim(claim);
        }
      })
      .catch(() => {});
  }, [livestreamChannelId]);

  React.useEffect(() => {
    function fetchIsStreaming() {
      fetch(`${BITWAVE_API}/${livestreamChannelId}`)
        .then((res) => res.json())
        .then((res) => {
          if (res && res.success && res.data && res.data.live) {
            setIsLivestreaming(true);
          } else {
            setIsLivestreaming(false);
          }
        })
        .catch((e) => {});
    }

    let interval;
    if (livestreamChannelId) {
      if (!interval) fetchIsStreaming();
      interval = setInterval(fetchIsStreaming, 10 * 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [livestreamChannelId]);

  if (!livestreamClaim || !isLivestreaming) {
    return null;
  }

  return (
    <Card
      className="livestream__channel-link"
      title="Live stream in progress"
      actions={<ClaimPreview uri={livestreamClaim.canonical_url} livestream type="inline" />}
    />
  );
}
