package clientdiscovery

abstract class Message {
    abstract val sender: Client
    abstract val recipient: Client

    fun send() = sender.sendMessage(this)
}
