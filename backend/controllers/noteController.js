const asyncHandler = require('express-async-handler')

const User = require('../models/userModel')
const Note = require('../models/noteModel')
const Ticket = require('../models/ticketModel')

// @desc   Get ticket notes
// @route  GET /api/tickets/:ticketId/notes
// @access Private
const getNotes = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id)

    if(!user){
        res.status(401)
        throw new Error('User not found')
    }

    const ticket = await Ticket.findById(req.params.ticketId)
    
    if(ticket.user === req.user.id){
        res.status(401)
        throw new Error('Not authorized')
    }

    const notes = await Note.find({ticket: req.params.ticketId})


    res.status(200).json(notes)
})

// @desc   Create note
// @route  POST /api/tickets/:ticketId/notes
// @access Private
const createNote = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id)

    if(!user){
        res.status(401)
        throw new Error('User not found')
    }

    const ticket = await Ticket.findById(req.params.ticketId)

    if(ticket.user === req.user.id){
        res.status(401)
        throw new Error('Not authorized')
    }

    const note = await Note.create(
        {
            ticket: req.params.ticketId,
            user: req.user.id,
            text: req.body.text
        })


    res.status(200).json(note)
})

module.exports = {getNotes, createNote}