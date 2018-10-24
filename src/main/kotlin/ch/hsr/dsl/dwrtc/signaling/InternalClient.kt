package ch.hsr.dsl.dwrtc.signaling

import mu.KLogging
import net.tomp2p.dht.PeerDHT

/**
 * Represents the own user.
 *
 * @property peer the TomP2P peer object
 * @property clientService the ClientService
 * @property sessionId the user's session ID
 */
class InternalClient(private val peer: PeerDHT, private val clientService: ClientService, val sessionId: String) {
    companion object : KLogging()

    fun sendMessage(messageBody: String, recipient: ExternalClient) {
        logger.info { "send message $messageBody from ${peer.peerAddress()} to $recipient" }

        val result = peer.peer()
                .sendDirect(recipient.peerAddress)
                .`object`(SignalingMessage(sessionId, recipient.sessionId, messageBody))
                .start().await()
        logger.info { "sent message $messageBody from ${peer.peerAddress()} to $recipient" }
        if (result.isFailed) throw Exception(result.failedReason())
    }

    /**
     * Register a listener that handles messages for this user
     *
     * @property emitter a callable that receives the sender and the actual message
     */
    fun onReceiveMessage(emitter: (ExternalClient, SignalingMessage) -> Unit) {
        logger.info { "register emitter for message receiving (own peer address ${peer.peerAddress()})" }

        clientService.addDirectMessageListener(sessionId, emitter)
    }
}
 
