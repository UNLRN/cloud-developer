import { Router, Request, Response } from 'express';
import { FeedItem } from '../models/FeedItem';
import { requireAuth } from '../../users/routes/auth.router';
import * as AWS from '../../../../aws';

const router: Router = Router();

// Get all feed items
router.get('/', async (req: Request, res: Response) => {
    const items = await FeedItem.findAndCountAll({order: [['id', 'DESC']]});
    items.rows.map((item) => {
            if(item.url) {
                item.url = AWS.getGetSignedUrl(item.url);
            }
    });
    res.send(items);
});

//Add an endpoint to GET a specific resource by Primary Key
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const item = await FeedItem.findByPk(id);
  res.send(item);
})

// update a specific resource
router.patch('/:id', 
    requireAuth, 
    async (req: Request, res: Response) => {
        const id = req.params.id;
        const { caption } = req.body;

        const [ affectedRows, item ] = await FeedItem.update({ caption }, { where: { id }, returning: true })
        // const [ affectedRows, item ] = await FeedItem.update({ caption }, { where: { id }, returning: true, plain: true })
        res.status(200).send(item)
});


// Get a signed url to put a new item in the bucket
router.get('/signed-url/:filename', 
    requireAuth, 
    async (req: Request, res: Response) => {
    let { filename } = req.params;
    const url = AWS.getPutSignedUrl(filename);
    res.status(201).send({url: url});
});

// Post meta data and the filename after a file is uploaded 
// NOTE the file name is they key name in the s3 bucket.
// body : {caption: string, filename: string};
router.post('/', 
    requireAuth, 
    async (req: Request, res: Response) => {
    const caption = req.body.caption;
    const filename = req.body.url;

    // check Caption is valid
    if (!caption) {
        return res.status(400).send({ message: 'Caption is required or malformed' });
    }

    // check filename is valid
    if (!filename) {
        return res.status(400).send({ message: 'File url is required' });
    }

    const item = await new FeedItem({
            caption: caption,
            url: filename
    });

    const saved_item = await item.save();

    saved_item.url = AWS.getGetSignedUrl(saved_item.url);
    res.status(201).send(saved_item);
});

export const FeedRouter: Router = router;