node-red-contrib-lirc
=====================
# Description
Lirc nodes for node-red.

Lirc documentation: http://www.lirc.org/

# What's inside?
It will include two nodes:

'lirc-controller' : a unique CONFIG node that holds connection configuration for Lirc and will acts as the encapsulator for Lirc access. As a node-red 'config' node, it cannot be added to a graph, but it acts as a singleton object that gets created in the the background when you add an 'lirc' or 'lirc-device' node and configure it accordingly.

'lirc-out' : Lirc output node that can send Lirc, so it can be used with function blocks.

-- payload contains:

--- string data - REQUIRED

**Right now it not tested in all directions, working with IP2CC and WF2IR.**
 
# Usage

According to official documentation: http://nodered.org/docs/getting-started/adding-nodes.html
 
# License

![Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)](https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png "CC BY-NC-SA 4.0")

#TODO

Implement autodiscovery by Beacon and arp tables