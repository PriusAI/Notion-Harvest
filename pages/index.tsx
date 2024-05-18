import * as React from 'react'

import { NotionPage } from '@/components/NotionPage'
import { domain } from '@/lib/config'
import { resolveNotionPage } from '@/lib/resolve-notion-page'

export const getStaticProps = async () => {
  try {
    const props = await resolveNotionPage(domain)

    return { props, revalidate: 10 }
  } catch (err) {
    console.error('page error', domain, err)

    // we don't want to publish the error version of this page, so
    // let next.js know explicitly that incremental SSG failed
    throw err
  }
}

export default function NotionDomainPage(props) {
  return (
    <>
      <NotionPage {...props} />
      <script src='https://sf-cdn.coze.com/obj/unpkg-va/flow-platform/chat-app-sdk/0.1.0-beta.2/libs/oversea/index.js'></script>
      <script
        dangerouslySetInnerHTML={{
          __html: `
new CozeWebSDK.WebChatClient({
config: {
bot_id: '7355500991959580690',
},
componentProps: {
title: 'Harvest',
icon: 'https://harvest.prius.ai/favicon-192x192.png'
},
});`
        }}
      ></script>
    </>
  )
}
