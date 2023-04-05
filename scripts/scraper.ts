import axios from 'axios';
import cheerio from 'cheerio';
import ObjectsToCsv from 'objects-to-csv';

const url: string = 'https://www.coupons.com/coupon-codes/macys';
const config: any = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36',
  },
};

interface Deal {
    title: string;
    amount: string;
}

axios.get(url, config)
    .then(response => {
        const $ = cheerio.load(response.data);
        const deals: Deal[] = [];

        $('._15mbvey8').each((i, element) => {
            const deal: Deal = {
                title: $(element).find('._1eilsni9.couponShape').text().trim(),
                amount: $(element).find('.tabletUpFlex .fef18m0').text().trim(),
            };
            deals.push(deal);
        });

        const csv = new ObjectsToCsv(deals);
        return csv.toDisk('./docs/deals.csv');
    })
    .then(() => {
        console.log('CSV file successfully created!');
    })
    .catch(error => {
        console.log(error);
    });