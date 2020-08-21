const { writeMainProcLog } = require('../communication/sync-msg');
const { receive_command } = require('../net-command/command-processer');

var CommandHeader = require('../net-command/command-header');

var csSock;
var rcvCommand;

/**
 * 수신된 데이터를 Command형식으로 변환 합니다.
 * @param {Buffer} rcvData 
 */
function readDataStream(rcvData){  
    console.log('\r\n++++++++++++++++++++++++++++++++++');
    console.log('rcvData:', rcvData);

    if (!rcvCommand){
        // 수신된 CommandHeader가 없다면 헤더를 만든다.
        rcvCommand = new CommandHeader(rcvData.readInt32LE(0), rcvData.readInt32LE(4));

        rcvCommand.data = rcvData.subarray(8);
        if (global.MAIN_CS_SEND_COMMAND) {
            rcvCommand.sendCmd = global.MAIN_CS_SEND_COMMAND
        }
    } else {
        // 헤더가 있다면 데이터 길이만큼 다 받았는지 확인한 후 처리로 넘긴다.
        rcvCommand.data = Buffer.concat([rcvCommand.data, rcvData]);        
    }

    if (!rcvCommand.readCnt) {
        rcvCommand.readCnt = 0;
    }

    rcvCommand.readCnt += rcvData.length;
    console.log('Recive Command Data :', rcvCommand);

    if (rcvCommand.size <= rcvCommand.readCnt) {
        // 데이터를 모두 다 받았다.

        var procCmd = rcvCommand;
        rcvCommand = null; // 처리시간동안 수신데이터가 오면 엉킴

        if (!receive_command(procCmd)) {
            console.log('Revceive Data Proc Fail! :', rcvData.toString('utf-8', 0));
        }
    }
};

/**
 * 서버로 해당 Command를 보냅니다.
 *
 * @param {CommandHeader} cmdHeader 
 * @param {Buffer} dataBuf 
 */
function writeCommand(cmdHeader, dataBuf) {
    try {
        rcvCommand = null;
        global.MAIN_CS_SEND_COMMAND = null;
        // Header Buffer
        var codeBuf = Buffer.alloc(4);
        var sizeBuf = Buffer.alloc(4);

        // Full Data Buffer
        var cmdBuf = Buffer.concat([codeBuf, sizeBuf, dataBuf]);

        // Create Dummy Buffer. Set the length to a multiple of 4.
        var dummyLength = Math.ceil(cmdBuf.length/4)*4;
        if (dummyLength != cmdBuf.length) {
            //console.log("cmdBuf Diff size:" + (dummyLength-cmdBuf.length) + ", DummySize:" + dummyLength + ", BufferSize:" + cmdBuf.length);
            var dummyBuf = Buffer.alloc(dummyLength-cmdBuf.length);
            cmdBuf = Buffer.concat([cmdBuf, dummyBuf]);
        }

        // Command Code
        codeBuf.writeInt32LE(cmdHeader.cmdCode);
        codeBuf.copy(cmdBuf);

        // full Size
        cmdHeader.size = cmdBuf.length;
        sizeBuf.writeInt32LE(cmdHeader.size);
        sizeBuf.copy(cmdBuf, 4, 0);

        csSock.write(cmdBuf);

        global.MAIN_CS_SEND_COMMAND = cmdHeader
        
        console.log('\r\n-------------------------- ');
        //writeMainProcLog("write Command ------ CMD: " + JSON.stringify(global.MAIN_CS_SEND_COMMAND));
        console.log("write Command : ", global.MAIN_CS_SEND_COMMAND);
    } catch (exception) {
        writeMainProcLog("write Command FAIL! CMD: " + cmdHeader.cmdCode + " ex: " + exception);
    }
 };

 /**
  * 서버 접속
  */
function connect (callback) {
    
    if (csSock) {
        csSock.destroy();
    }
    
    writeMainProcLog("Conncect MAIN_CS to " + JSON.stringify(global.SERVER_INFO.CS, null, 0))

    var tcpSock = require('net');  
    var client  = new tcpSock.Socket;  
    csSock = client.connect(global.SERVER_INFO.CS.server_port, global.SERVER_INFO.CS.server_ip, function() {
        writeMainProcLog("Conncect MAIN_CS Completed to " + JSON.stringify(global.SERVER_INFO.CS, null, 0))
        global.SERVER_INFO.CS.isConnected = true;

        callback();
    });  

    // listen for incoming data
    csSock.on("data", function(data){
        readDataStream(data);
    })

    // 접속이 종료됬을때 메시지 출력
    csSock.on('end', function(){
        writeMainProcLog('Disconnected!');
        global.SERVER_INFO.CS.isConnected = true;
    });
    // 
    csSock.on('close', function(hadError){
        writeMainProcLog("Close. hadError: " + hadError);
        global.SERVER_INFO.CS.isConnected = true;
    });
    // 에러가 발생할때 에러메시지 화면에 출력
    csSock.on('error', function(err){
        writeMainProcLog("Error: " + JSON.stringify(err));
        global.SERVER_INFO.CS.isConnected = true;
    });
    // connection에서 timeout이 발생하면 메시지 출력
    csSock.on('timeout', function(){
        writeMainProcLog('Connection timeout.');
        global.SERVER_INFO.CS.isConnected = true;
    });
};


module.exports = {
    connectCS: connect,
    writeCommandCS: writeCommand
};