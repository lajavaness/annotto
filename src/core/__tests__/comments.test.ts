import crypto from 'crypto'
import mongoose from 'mongoose'
import CommentModel, { Comment } from '../../db/models/comments'
import LogModel from '../../db/models/logs'
import { logComment } from '../logs'
import { saveComment } from '../comments'
import mongoSetupTeardown from './mongoSetupTeardown'

mongoSetupTeardown()

describe('logs', () => {
  test('logComment', async () => {
    const comment = <Comment>(<unknown>{
      comment: 'toto',
      _user: {
        _id: new mongoose.Types.ObjectId().toString(),
        email: `${crypto.randomBytes(10).toString('hex')}@lajavaness.com`,
        firstName: `${crypto.randomBytes(10).toString('hex')}`,
        lastName: `${crypto.randomBytes(10).toString('hex')}@lajavaness.com`,
      },
    })

    const res = await logComment(comment)
    expect(res.commentMessage).toBe(comment.comment)
    expect(res.type).toBe('comment-add')
  })
})

describe('comment model', () => {
  test('Comment save', async () => {
    const newComment = new CommentModel({
      comment: crypto.randomBytes(10).toString('hex'),
    })
    const user = {
      _id: new mongoose.Types.ObjectId().toString(),
      firstName: 'Taylor',
      lastName: 'Durden',
      email: 'taylor@fighclub.com',
    }

    const n = await saveComment(newComment, user)
    expect(n._id).toBeDefined()
    expect(n.comment).toBe(newComment.comment)
    const l = await LogModel.findOne({
      comment: n._id,
      commentMessage: n.comment,
    })
    expect(l).toBeDefined()
    expect(l && l.comment.toString()).toBe(n._id.toString())
    expect(l && l.commentMessage).toBe(n.comment)
    expect(l && (l.user._id || '').toString()).toBe((n.user._id || '').toString())
    expect(l && l.user.firstName).toBe(n.user.firstName)
    expect(l && l.user.lastName).toBe(n.user.lastName)
    expect(l && l.user.email).toBe(n.user.email)
    expect(l && l.type).toBe('comment-add')
  })
})
