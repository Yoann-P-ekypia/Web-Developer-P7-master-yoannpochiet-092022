//Package file system pour modifier le système de donnée pour la foncion delete
const fs = require('fs');

//Import du modele de message
const Message = require("../models/Message");

//Création d'une message
exports.create = (req, res, next) => {
    const messageObjet = JSON.parse(req.body.message);
    const message = new Message({
        ...messageObjet,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    message
        .save()
        .then((message) => {
            res.status(201).json({ message });
        })
        .catch((error) => {
            res.status(400).json({
                error: error,
            });
        });
};

//Modification d'un message
exports.update = (req, res, next) => {
    const messageObject = req.file ?
        {
            ...JSON.parse(req.body.message),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : { ...req.body };
    if (req.file) {
        Message.findOne({ _id: req.params.id })
            .then((message) => {
                const filename = message.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Message.updateOne({ _id: req.params.id }, { ...messageObject, _id: req.params.id })
                        .then(() => { res.status(200).json({ message: 'message mise à jour!' }); })
                        .catch((error) => { res.status(400).json({ error }); });
                })
            })
            .catch((error) => { res.status(500).json({ error }); });

    } else {
        Message.updateOne({ _id: req.params.id }, { ...messageObject, _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Message mise à jour!' }))
            .catch((error) => res.status(400).json({ error }));
    }
};

//Récupération de tout les messages
exports.list = (req, res, next) => {
    Message.find()
        .then((messages) => {
            res.status(200).json(messages);
        })
        .catch((error) => {
            res.status(400).json({
                error: error,
            });
        });
};

//Récupère un message unique par l'id
exports.OneMessage = (req, res, next) => {
    Message.findOne({
        _id: req.params.id,
    })
        .then((message) => {
            res.status(200).json(message);
        })
        .catch((error) => {
            res.status(404).json({
                error: error,
            });
        });
};

//Supprimer un message
exports.delete = (req, res, next) => {
    Message.findOne({ _id: req.params.id })
        .then(message => {
            const filename = message.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Message.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Objet supprimé !' }))
                    .catch(error => res.status(400).json({ error }));
            });
        })
        .catch(error => res.status(500).json({ error }));
};

//Like message
exports.likeMessage = (req, res, next) => {
    switch (req.body.like) {
        //cancel = 0
        //check if the user had liked or disliked the message
        //uptade the message, send message/error
        case 0:
            Message.findOne({ _id: req.params.id })
                .then((message) => {
                    if (message.usersLiked.find(user => user === req.body.userId)) {
                        Message.updateOne({ _id: req.params.id }, {
                            $inc: { likes: -1 },
                            $pull: { usersLiked: req.body.userId },
                            _id: req.params.id
                        })
                            .then(() => { res.status(201).json({ message: 'Ton avis a été pris en compte!' }); })
                            .catch((error) => { res.status(400).json({ error: error }); });

                    } if (message.usersDisliked.find(user => user === req.body.userId)) {
                        Message.updateOne({ _id: req.params.id }, {
                            $inc: { dislikes: -1 },
                            $pull: { usersDisliked: req.body.userId },
                            _id: req.params.id
                        })
                            .then(() => { res.status(201).json({ message: 'Ton avis a été pris en compte!' }); })
                            .catch((error) => { res.status(400).json({ error: error }); });
                    }
                })
                .catch((error) => { res.status(404).json({ error: error }); });
            break;
        //likes = 1
        //uptade the message, send message/error
        case 1:
            Message.updateOne({ _id: req.params.id }, {
                $inc: { likes: 1 },
                $push: { usersLiked: req.body.userId },
                _id: req.params.id
            })
                .then(() => { res.status(201).json({ message: 'Ton like a été pris en compte!' }); })
                .catch((error) => { res.status(400).json({ error: error }); });
            break;
        //likes = -1
        //uptade the message, send message/error
        case -1:
            Message.updateOne({ _id: req.params.id }, {
                $inc: { dislikes: 1 },
                $push: { usersDisliked: req.body.userId },
                _id: req.params.id
            })
                .then(() => { res.status(201).json({ message: 'Ton dislike a été pris en compte!' }); })
                .catch((error) => { res.status(400).json({ error: error }); });
            break;
        default:
            console.error('not today : mauvaise requête');
    }
};