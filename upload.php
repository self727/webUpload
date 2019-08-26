<?php

require_once("./FileUploadClass.php");
fileUpload_set();

//文件上传
function fileUpload_set(){
    $path="./file/video";
    $maxSize=2000*1024*1024;
    $exts=['mp4','zip'];

    $file=new FileUploadClass();
    /**
     * 上传文件
     * @param $mPath           保存地址
     * @param string $mMaxSize 限制文件大小   单位b
     * @param array  $mExts    限制文件格式 array
     * @return bool
     */
    $msg=$file->fileSave($path,$maxSize,$exts);
    $res = $file->msg($msg['status'],$msg['info']);
    exit(json_encode($res));
}   
?>