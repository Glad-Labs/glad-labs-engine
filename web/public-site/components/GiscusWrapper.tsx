import GiscusComments from './GiscusComments';

interface GiscusWrapperProps {
  postSlug: string;
  postTitle: string;
}

export function GiscusWrapper({ postSlug, postTitle }: GiscusWrapperProps) {
  return <GiscusComments postSlug={postSlug} postTitle={postTitle} />;
}
