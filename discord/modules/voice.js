const uuid = require("uuid");
const {
    joinVoiceChannel,
    getVoiceConnection,
    createAudioPlayer,
    NoSubscriberBehavior,
    createAudioResource
} = require('@discordjs/voice');

module.exports.details = {
    name: "voice"
}

let voice = {};

module.exports.actions = {
    "join-voice": {
        name: "Join Voice Channel",
        description: "Join a Voice Channel",
        inputs: {
            "channelId": {
                name: "Channel id"
            }
        },
        execute: (data) => {
            return new Promise((resolve, reject) => {
                data.client.channels.fetch(data.action.channelId).then(channel => {
                    const connection = joinVoiceChannel({
                        channelId: channel.id,
                        guildId: channel.guild.id,
                        adapterCreator: channel.guild.voiceAdapterCreator,
                    });
                }).catch(err => {
                    reject(err.toString());
                });
            });
        }
    },
    "play-audio": {
        name: "Play Audio",
        description: "Plays audio in the specified voice connection channel",
        inputs: {
            "channelId": {
                name: "Channel id"
            },
            "audio": {
                name: "filename"
            }
        },
        execute: (data) => {
            return new Promise((resolve, reject) => {
                data.client.channels.fetch(data.action.channelId).then(channel => {
                    const connection = getVoiceConnection(channel.guild.id);

                    const player = createAudioPlayer();

                    player.on('connectionCreate', (queue) => {
                        queue.connection.voiceConnection.on('stateChange', (oldState, newState) => {
                            if (oldState.status === VoiceConnectionStatus.Ready && newState.status === VoiceConnectionStatus.Connecting) {
                                queue.connection.voiceConnection.configureNetworking();
                            }
                        })
                    });

                    const resource = createAudioResource(data.action.audio);
                    player.play(resource);

                    connection.subscribe(player);
                }).catch(err => {
                    reject(err.toString());
                });
            });
        }
    },

    "leave-voice": {
        name: "Leave Voice Channel",
        description: "Leaves a voice channel",
        inputs: {
            "channelId": {
                name: "Channel id"
            }
        },
        execute: (data) => {
            return new Promise((resolve, reject) => {
                data.client.channels.fetch(data.action.channelId).then(channel => {
                    const connection = getVoiceConnection(channel.guild.id);
                    connection.destroy();
                }).catch(err => {
                    reject(err.toString());
                });
            });
        }
    },
}