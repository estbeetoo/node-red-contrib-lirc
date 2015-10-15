var Util            = require('util');
var EventEmitter 	= require('events').EventEmitter;

function LircManager(){
	if (!(this instanceof LircManager)) {
        return new LircManager();
    }

	this._lirc = require('lirc_node');
    this.minSendTimeout = 100;
    this._isPause = false;
    this._reqFifo = [];
    this.isReady = false;
    this.activeOutput = 1;

    LircManager.super_.call(this);
}

Util.inherits(LircManager, EventEmitter);

LircManager.prototype._flush = function(){
	if (this._isPause)
		return;

	this.init();

	if (this.isReady && this._reqFifo.length > 0){
		var pkt = this._reqFifo.shift();
		if (this.activeOutput != pkt.output){
			this._lirc.irsend.set_transmitters(pkt.output, function(err){
				if (err){
					console.log('exec irsend SET_TRANSMITTERS error: ' + err);
					this._resetPause(this)();
					return;
				}
				this.emit('changeOutput');
				this.activeOutput = pkt.output;
				this._lirc.irsend.send_once(pkt.device, pkt.cmd, pkt.cb);
				this._isPause = true;
				setTimeout(this._resetPause(this), this.minSendTimeout);
			}.bind(this));
		} else {
			this._lirc.irsend.send_once(pkt.device, pkt.cmd, pkt.cb);
			this._isPause = true;
			setTimeout(this._resetPause(this), this.minSendTimeout);
		}
	}
};

LircManager.prototype._resetPause=function(that){
	return function(){
		that._isPause = false;
		that._flush();
	}
};

LircManager.prototype.send = function(device, cmd, output, cb){
	if (!(device && cmd))
		return;

	var out = output || this.activeOutput;

	this._reqFifo.push({output: out, device: device, cmd: cmd, cb: cb});
	this._flush();
};

LircManager.prototype.init = function(){
	if (this.isReady == false){
		this._lirc.init();
		this.isReady = true;
		this.emit('ready');
	}
};

LircManager.prototype.end = function(){
	this.isReady = false;
	this.emit('notReady');
};

module.exports = {LircManager: LircManager};