import delve from 'dlv';
import dynamic from 'next/dynamic';

const ArticleContent = dynamic(
  () => import('../../components/pages/blog/ArticleContent'),
  { ssr: false }
);

import Layout from '../../components/layout';
import BlockManager from '../../components/shared/BlockManager';

import { getStrapiURL } from '../../utils';
import { getLocalizedParams } from '../../utils/localize';

const Article = ({ global, pageData, preview }) => {
  const blocks = delve(pageData, 'attributes.blocks');
  return (
    <>
      <Layout
        global={global}
        pageData={pageData}
        preview={preview}
        type="article"
      >
        <ArticleContent {...pageData} />
        {blocks && (
          <BlockManager
            blocks={blocks}
            type="collectionType"
            contentType="blog"
            pageData={pageData}
          />
        )}
      </Layout>
    </>
  );
};

// This gets called on every request
export async function getServerSideProps(context) {
  const { locale } = getLocalizedParams(context.query);
  const preview = context.draftMode
    ? '&publicationState=preview&published_at_null=true&encodeSourceMaps=true'
    : '';
  const res = await fetch(
    getStrapiURL(
      `/articles?filters[slug]=${context.params.slug}&locale=${locale}${preview}&populate=localizations,image,author.picture,blocks.articles.image,blocks.faq,blocks.header`
    )
  );

  const json = await res.json();

  if (!json.data.length) {
    return {
      redirect: {
        destination: '/blog',
        permanent: false,
      },
    };
  }

  return {
    props: { pageData: json.data[0], preview: context.draftMode || null },
  };
}

export default Article;
