import axios from 'axios';
import cheerio from 'cheerio';
import ObjectsToCsv from 'objects-to-csv';
import fs from 'fs';

const url: string = 'file:///Users/yodnoralov/Websites/coupons-ai/gpt-pdf-chatbot-langchain/data/raw%20html/20%25%20Off%20Macy\'s%20Coupons,%20Promo%20Codes%20+%205%25%20Cash%20Back%202023.html';
const config: any = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:35.0) Gecko/20100101 Firefox/35.0',
  },
};

const filePath: string = '/Users/yodnoralov/Websites/coupons-ai/gpt-pdf-chatbot-langchain/data/raw/rmn.html';

interface Deal {
    title: string;
    amount: string;
}

fs.readFile(filePath, 'utf-8', (err, html) => {
  if (err) {
    console.log(err);
    return;
  }

  const $ = cheerio.load(html);
  const deals: Deal[] = [];

  $('.styles__StoreOfferBucketList-uj1any-0.iRzGH .styles__StoreOfferListItem-uj1any-1').each((i, element) => {
    const deal: Deal = {
      title: $(element).find('.styles__Title-sc-1mhh8r9-9').text().trim(),
      amount: $(element).find('.OfferAnchor__StyledOfferAnchor-sc-1pe54et-0').text().trim(),
    };
    deals.push(deal);
  });

  const csv = new ObjectsToCsv(deals);
  csv.toDisk('./docs/deals.csv')
      .then(() => {
        console.log('CSV file successfully created!');
      })
      .catch(error => {
        console.log(error);
      });
});