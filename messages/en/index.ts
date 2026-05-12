// AUTO-GENERATED barrel for messages/en/*.json
// Merges every namespace file into a single object the rest of the app
// can consume as if it were the old monolithic en.json.

import common from './common.json';
import home from './home.json';
import featAccount from './feat-account.json';
import featBooking from './feat-booking.json';
import featChat from './feat-chat.json';
import featHost from './feat-host.json';
import featPayment from './feat-payment.json';
import featProperty from './feat-property.json';
import featSearch from './feat-search.json';
import featWishlist from './feat-wishlist.json';
import pagesAbout from './pages-about.json';
import pagesAuth from './pages-auth.json';
import pagesContact from './pages-contact.json';
import pagesFaq from './pages-faq.json';
import pagesHelp from './pages-help.json';
import pagesLegal from './pages-legal.json';
import pagesMarketing from './pages-marketing.json';
import pagesNeighborhoods from './pages-neighborhoods.json';

const dict = {
  ...common,
  ...home,
  ...featAccount,
  ...featBooking,
  ...featChat,
  ...featHost,
  ...featPayment,
  ...featProperty,
  ...featSearch,
  ...featWishlist,
  ...pagesAbout,
  ...pagesAuth,
  ...pagesContact,
  ...pagesFaq,
  ...pagesHelp,
  ...pagesLegal,
  ...pagesMarketing,
  ...pagesNeighborhoods,
};

export default dict;
