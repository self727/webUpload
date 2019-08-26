(function ($, window) {
    var msg;
    var uploader
    function initWebUpload(item, options) {
        uploader = WebUploader.create(options);
        var mdNumber='';
        var target=item;
        var $list = target.find('.uploader-list');
        // 当有文件被添加进队列的时候
        uploader.on('fileQueued', function (file) {
            $list.append('<div id="' + file.id + '" class="item">' +
                '<h4 class="info">' + file.name + '</h4>' +
                '<p class="state">等待上传...</p>' +
                '<div class="remove-this" >删除</div>'+
                '</div>');
        });

        //局部设置，给每个独立的文件上传请求参数设置，每次发送都会发送此对象中的参数。。参考：
        // https://github.com/fex-team/webuploader/issues/145
        uploader.on('uploadBeforeSend', function( block, data, headers) {
            //获取 上传的第几个几个块（分片）
            data.chunk = block.chunk;
            //获取 总块数（分片数）
            data.chunks = block.chunks;

            data.mdNumber = mdNumber;
        });

        // 文件上传过程中创建进度条实时显示。
        uploader.on('uploadProgress', function (file, percentage) {
            var $li = $('#' + file.id),
                $percent = $li.find('.progress .progress-bar');

            // 避免重复创建
            if (!$percent.length) {
                $percent = $('<div class="progress progress-striped active">' +
                    '<div class="progress-bar" role="progressbar" style="width: 0%">' +
                    '</div>' +
                    '</div>').appendTo($li).find('.progress-bar');
            }

            $li.find('p.state').text('上传中 - '+parseInt(percentage * 100) + '%');

            $percent.css('width', parseInt(percentage * 100) + '%');
        });

        //上传成功
        uploader.on('uploadSuccess', function (file,ret) {

            if (ret.status=='error'){
                $('#' + file.id).find('p.state').text(ret.info);
            }else if(ret.status=='ok'){
                $('#' + file.id).find('p.state').text('已上传');
                msg=ret.info;

                /*$(options.pick).attr('data-f',ret.info.zip) ;*/
                console.log(ret);
                $(options.pick).append('<input name="fileupload" type="hidden" value="'+ret.info.zip+'">').attr('data-f',ret.info.zip) ;
                $(options.pick).append('<input name="picupload" type="hidden" value="'+ret.info.img+'">').attr('data-f',ret.info.img) ;
            }
        });

        //上传失败
        uploader.on('uploadError', function (file,ret) {
            $('#' + file.id).find('p.state').text('上传出错');
        });

        //文件加入队列前执行  目前我用来清空当前拥有的队列
        uploader.on('beforeFileQueued', function (file,ret) {
            var files=uploader.getFiles();
            if (files.length!=0){
                for (var i in files){
                    uploader.removeFile(files[i]['id']);
                }
            }
            $list.html("");
        });

        //上传成功或失败都会执行
        uploader.on('uploadComplete', function (file) {
            $('#' + file.id).find('.progress').fadeOut();
        });

        //获取当前状态
        var state='';
        uploader.on('all', function (type) {
            if (type === 'startUpload') {
                state = 'uploading';
            } else if (type === 'stopUpload') {
                state = 'paused';
            } else if (type === 'uploadFinished') {
                state = 'done';
            }
            if (state === 'uploading') {
                $('#btnSave').text('暂停上传');
            } else {
                $('#btnSave').text('开始上传');
            }
        });

        //上传按钮
        $('#btnSave').bind('click', function () {
            mdNumber=rand(15);
            uploader.upload();
        });

        //删除
        $list.on("click", ".remove-this", function () {
            $list.html("");
            uploader.reset();
        });
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
    }
    $.fn.msg=function () {

        return msg;
    }
    $.fn.powerWebUpload = function (options) {
        var ele = this;
        var p={
            // swf文件路径
            swf: '/static/public/webupload/Uploader.swf',
            // 文件接收服务端。
            server: '/admin.php/product/fileUpload_set',
            // 选择文件的按钮。可选。
            // 内部根据当前运行是创建，可能是input元素，也可能是flash.
            pick: '#picker',
            //true选择文件自动上传
            auto:true,
            //验证文件总数量, 超出则不允许加入队列。
            fileNumLimit:3,
            //开启分片上传
            chunked: true,
            //上传并发数
            threads: 1,
            //上传文件大小
            chunkSize:2*1024*1024,
            /*chunkSize:2*1024*1024,*/
            accept:{
                title: 'Images',
                extensions: 'gif,jpg,jpeg,bmp,png',
                mimeTypes: 'image/*'
            },
            // 不压缩image, 默认如果是jpeg，文件上传前会压缩一把再上传！
            resize: false
        };
        options = $.extend({}, p, options);
        initWebUpload(ele, options);

    }
})(jQuery, window);