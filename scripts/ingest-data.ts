import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings';
import { PineconeStore } from 'langchain/vectorstores';
import { pinecone } from '@/utils/pinecone-client';
import { CustomPDFLoader } from '@/utils/customPDFLoader';
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '@/config/pinecone';
import { DirectoryLoader, CSVLoader } from 'langchain/document_loaders';

import fs from 'fs';
import { join } from 'path';

/* Name of directory to retrieve your files from */
const filePath = 'docs/macys';

export const run = async () => {
  try {
    /*load raw docs from the all files in the directory */
    const directoryLoader = new DirectoryLoader(filePath, {
      '.pdf': (path) => new CustomPDFLoader(path),
    });

    // const loader = new PDFLoader(filePath);
    const rawDocs = await directoryLoader.load();

    const files = fs.readdirSync(filePath); // read directory contents
    const csvFiles = files.filter(file => file.endsWith('.csv')); // filter out non-CSV files

    const loaders = csvFiles.map(file => new CSVLoader(join(filePath, file))); // create a CSVLoader for each CSV file
    const rawCSVs = await Promise.all(loaders.map(loader => loader.load())); // load all CSV files in parallel
    const docs = rawCSVs.reduce((acc, curr) => acc.concat(curr), []);

    console.log('raw CSV: ', docs);

    /* Split text into chunks - ! CSV loader already split rows into separate docs*/
    // const textSplitter = new RecursiveCharacterTextSplitter({
    //   chunkSize: 1000,
    //   chunkOverlap: 0,
    // });
    //
    // const docs = await textSplitter.splitDocuments(rawCSVs);
    // console.log('split CSV: ', docs);

    /*create and store the embeddings in the vectorStore*/
    console.log('creating vector store...');
    const embeddings = new OpenAIEmbeddings();
    const index = pinecone.Index(PINECONE_INDEX_NAME);

    //embed the PDF documents
    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex: index,
      namespace: PINECONE_NAME_SPACE,
      textKey: 'text',
    });
  } catch (error) {
    console.log('error', error);
    throw new Error('Failed to ingest your data');
  }
};

(async () => {
  await run();
  console.log('ingestion complete');
})();
