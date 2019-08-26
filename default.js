$(function () {

    var uploader = WebUploader.create({
        // swf文件路径
        swf: './webupload/Uploader.swf',
        // 文件接收服务端。
        server: 'http://127.0.0.1/upload/upload.php',
        //后缀名验证
        accept:{
            title:'mp4,zip',
            extensions:'mp4,zip',
            mimeTypes:'.mp4,.zip'
        },
        //分片上传
        chunked:true,
        //分片上传大小  这是2M
        chunkSize:1024*1024*2,
        //文件并发数 因为是分片有排序规则所以并发数为1
        threads:1,
        // 选择文件的按钮。可选。
        // 内部根据当前运行是创建，可能是input元素，也可能是flash.
        pick: '#picker',
        //限制文件总数
        fileNumLimit:1,
        // 不压缩image, 默认如果是jpeg，文件上传前会压缩一把再上传！
        resize: false
    })
    // 当有文件被添加进队列的时候
    var $list=$('#thelist');
    //随机码
    var randCode='';
    uploader.on( 'fileQueued', function( file ) {
        $list.append( '<div id="' + file.id + '" class="item">' +
            '<h4 class="info">' + file.name + '</h4>' +
            '<div class="progress progress-striped active">' +
            '<div class="progress-bar" role="progressbar"></div></div>'+
            '<div class="state progress-txt fl" title="">等待上传...</div>' +
            '<div id="' + file.id + '_del" class="del_upload fr" data-id="' + file.id + '">删除</div>' +
            '<div id="' + file.id + '_stop" class="stop_upload fr" data-id="' + file.id + '">停止</div>' +
            '<div id="' + file.id + '_continue" class="continue_upload fr" data-id="' + file.id + '">继续</div>' +
            '<div id="' + file.id + '_upload" class="start_upload fr current" data-id="' + file.id + '">开始上传</div>' +
            '<div id="' + file.id + '_again" class="again_upload fr " data-id="' + file.id + '">重新上传</div>' +
            '</div>');
        //删除
        $list.on('click','#'+file.id+'_del',function () {
            uploader.cancelFile(file);
            $(this).closest('.item').remove();
        });
        //停止
        $list.on('click','#'+file.id+'_stop',function () {
            $(this).removeClass('current');
            $(this).parent('.item').find('.again_upload').addClass('current');
            /*uploader.stop(file);*/
            uploader.cancelFile(file);
            console.log(uploader.getStats());
        })
        //继续上传
        $list.on('click','#'+file.id+'_continue',function () {
            $(this).removeClass('current');
            $(this).parent('.item').find('.stop_upload').addClass('current');
            uploader.upload(file);
        })
        //开始上传
        $list.on('click','#'+file.id+'_upload',function () {
            $(this).removeClass('current');
            $(this).parent('.item').find('.stop_upload').addClass('current');
            randCode=rand(15);
            uploader.upload(file);

        })
        //重传
        $list.on('click','#'+file.id+'_again',function () {
            $(this).removeClass('current');
            $(this).parent('.item').find('.stop_upload').addClass('current');
            randCode=rand(15);
            uploader.upload(file.id);
        });

    });
    // 文件上传过程中创建进度条实时显示。
    uploader.on( 'uploadProgress', function( file, percentage ) {
        var $li = $( '#'+file.id ),
            $percent = $li.find('.progress .progress-bar');
        // 避免重复创建
        if ( !$percent.length ) {
            $percent = $('<div class="progress progress-striped active">' +
                '<div class="progress-bar" role="progressbar" style="width: 0%">' +
                '</div>' +
                '</div>').appendTo( $li ).find('.progress-bar');
        }
        $li.find('.state').text('上传中 - '+parseInt(percentage * 100) + '%');
        $percent.css( 'width', parseInt(percentage * 100) + '%' );
    });

    //文件成功处理
    uploader.on( 'uploadSuccess', function( file ,data) {

        //data 为服务器返回的数据
        console.log(data);
        if(data.status=='ok'){
            if ($('#successInfo').length){
                $('#successInfo').remove();
            }
            $('<input type="hidden" name="fileupload" value="'+data.info+'"></div>').appendTo('#imgCtn');
            $( '#'+file.id ).find('.state').text('上传完成 - 100%');
            subTime();
        }else{
            $( '#'+file.id ).find('.state').text(data.info);
        };
    });

    //文件失败处理
    uploader.on( 'uploadError', function( file ) {
        $( '#'+file.id ).find('p.state').text('上传出错');
    });

    //上传失败获成功都会执行
    uploader.on('uploadComplete',function (file) {
        $('#'+file.id).find('.current').removeClass('current');
        $('#'+file.id).find('.again_upload').addClass('current');
    })
    //文件加入队列前执行
    uploader.on('beforeFileQueued', function (file) {

    });

    //主要用来询问是否要添加附带参数，大文件在开起分片上传的前提下此事件可能会触发多次
    uploader.on('uploadBeforeSend',function (file,data) {
        //随机码
        data.randCode=randCode;
    });
    //当所有文件上传完成
    uploader.on('uploadFinished',function (file,data) {

    });

    //开始上传
    $('#ctlBtn').on('click', function() {
        uploader.upload();
    });

    // 初始化以后添加 参数
    //uploader.options.formData.uid = 456789;

    //随机码
    function rand(i) {
        var str='123456789qwertyiopasdfghjklzxcvbnm';
        var strLen=str.length;
        var newStr='';
        Math.random()*strLen;
        while(i>0){
            newStr+=str[parseInt(Math.random()*strLen)];
            i--;
        }
        return newStr;
    }

    var t;
    function subTime() {
        console.log(1)
        var i=3;
        if (t){
            clearInterval(t);
        }
        t=setInterval(function () {
            $('#submit span').text('('+i+'秒后)自动提交');
            if (i==0){
                clearInterval(t);
                $('#submit span').text('提交作品');
                $('#submit').click();
                return;
            };
            i--;
        },1000);
    }


})