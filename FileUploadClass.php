<?php

class FileUploadClass
{
    public $msg=[];

    /**
     * 上传文件
     * @param $mPath           保存地址
     * @param string $mMaxSize 限制文件大小   单位b
     * @param array  $mExts    限制文件格式 array
     * @return bool
     */
    public function fileSave($mPath,$mMaxSize=20*1024*1024,$mExts=[]){
        if (strpos($mPath,'.')!==0){
            $mPath='.'.$mPath;
        }
        $arr=explode('/',$mPath);
        $aimUrl='';
        foreach($arr as $str){
            $aimUrl.=$str.'/';
            if(!file_exists($aimUrl)){
                mkdir($aimUrl,0777);
                chmod($aimUrl,0777);
            }
        }
        if (!file_exists($aimUrl)) {
            $this->msg('error','创建目录失败');
            return false;
        }else{
            require './org/Upload.php';
            $upload = new \org\Upload();
            $upload->maxSize = $mMaxSize;
            if($mExts){
                $upload->exts = $mExts;
            }
            $upload->rootPath = $aimUrl;
            $upload->driver = "Local";
            $upload->saveName = ['uniqid', ''];
            $info = $upload->upload();
            if (!$info) {
                $this->msg('error',$upload->getError());
                return false;
            } else {
                $aimUrl=str_replace('./','/',$aimUrl);
                //这里$infoyn[0]是指你上传第一个图片的信息,你如果上传N个图片就会有$infoyn[N]
                if(isset($info[0]['savepath'])){
                    $filePath=$aimUrl . $info[0]['savepath'] . $info[0]['savename'];
                }else{
                    $filePath=$aimUrl . $info['file']['savepath'] . $info['file']['savename'];
                    //获取文件格式
                    $ext=substr($info['file']['savename'],strrpos($info['file']['savename'],'.'));
                    //文件合并（分片上传）
                    if(!empty($_POST['chunks'])&&$_POST['chunks']!=1){
                        return $this->fileCombine($_POST['randCode'].$ext,$mPath,'.'.$filePath,$info['file']['savename']);
                    }
                }
                $this->msg('ok',$filePath,['fileName'=>$info['file']['name']]);
                return true;
            }
        }
        return true;
    }

    /**
     * 文件合并
     * @param $filename    上传的文件名
     * @param $mPath       缓存文件夹路径
     * @param $filesAddr    文件详细地址
     * @param $savename    保存文件的新名称
     * @return array
     */
    public function fileCombine($filename,$mPath,$filesAddr,$savename){
        $oldPath=$mPath.'/'.$filename;
        $newPath=$mPath.'/'.$savename;

        if (!file_exists($mPath)){
            @mkdir($mPath,0777);
        }
        if(file_put_contents($oldPath,file_get_contents($filesAddr),FILE_APPEND)){
            if ($_POST['chunks']==$_POST['chunk']+1){
                @rename($oldPath,$newPath);
            }else{
                @unlink($filesAddr);
            }
            $this->msg('ok',$newPath);
            return true;
        }else{
            $this->msg('error','文件合并失败');
            @unlink($filesAddr);
            return false;
        };
    }

    /**
     * 移动文件
     * @param $filePath     文件原路径支持数组{a,b~~},字符串 "a,b,c~~"或 "a"
     * @param $movePath     移动后的目录地址
     * @return array
     */
    function fileMove($filePath,$movePath){

        if(is_string($filePath)){
            $imgArr=explode(',',$filePath);
        }elseif(is_array($filePath)){
            $imgArr=$filePath;
        }else{
            $this->msg('error','文件路径只能为字符串或数组');
            return false;
        }

        foreach ($imgArr as $vo){
            if (!empty($vo)){
                if(strpos($vo,'.')!==0){
                    $vo=".".$vo;
                }
                if(strpos($movePath,'.')!==0){
                    $movePath=".".$movePath;
                }
                if(!file_exists($vo)){
                    $this->msg('error','目标文件不存在');
                    return false;
                }else{
                    $fileName=substr($vo,strrpos($vo,'/')+1);
                    $fileArr=explode('/',$movePath);
                    $aimUrl='';
                    foreach($fileArr as $v){
                        $aimUrl.=$v.'/';
                        if (!file_exists($aimUrl)){
                            if(mkdir($aimUrl,0777,true)){
                                $this->msg('error','创建文件夹失败');
                                return false;
                            };
                            //取得文件最大权限
                            chmod($aimUrl, 0777);
                        }
                    }
                    //移动文件
                    if(!rename($vo , $movePath.$fileName)){
                        $this->msg('error','移动文件失败');
                        return false;
                    };
                }
            }
        }
        $this->msg('ok',$movePath.$fileName);
        return true;
    }

    /**
     * 删除文件
     * @param $dir 删除的文件路径 或 目录
     * @return bool
     */
    function fileDelete($dir){
        if (strpos($dir,'.')!==0){
            $dir='.'.$dir;
        }
        if (filetype($dir)=='dir'){
            if ($dh=opendir($dir)){
                while (($file=readdir($dh))!==false){
                    if($file=='.'||$file=='..'){
                        continue;
                    }
                    if (filetype($dir.'/'. $file)=='dir'){
                        if (!$this->deleteFiles($dir.'/' . $file)){
                            return false;
                        }
                        if(!rmdir($dir.'/'.$file)){
                            $this->msg('error','删除失败('.$dir.'/'.$file.')');
                            return false;
                        }
                    }else{
                        if(!unlink($dir.'/' . $file)){
                            $this->msg('error','删除失败('.$dir.'/'.$file.')');
                            return false;
                        }
                    }

                }
                closedir($dh);
            }
        }else{
            if(!@unlink($dir)){
                $this->msg('error','删除失败');
                return false;
            }
        }
        return true;
    }

    /**
     * 下载文件
     * @param $filePath     目标文件的路劲
     * @param string $filename  下载时显示的名称
     * @return bool
     */
    public function fileDownload($filePath,$filename=''){
        if(empty($filePath)){
            $this->msg('error','缺少文件路劲');
            return false;
        }
        if (strpos($filePath,'.')!==0){
            $filePath='.'.$filePath;
        }

        if (is_file($filePath)) {
            $length = filesize($filePath);

            if ($filename){
                $ext=strrchr($filePath,'.');
                $showname = $filename.$ext;
            }else{
                $showname = ltrim(strrchr($filePath, '/'), '/');
            }
            $realpath =realpath($filePath);
            header("Content-Description: File Transfer");
            header('Content-type: application/octet-stream');
            header('Content-Length:' . $length);
            if (preg_match('/MSIE/', $_SERVER['HTTP_USER_AGENT'])) { //for IE
                header('Content-Disposition: attachment; filename="' . rawurlencode($showname) . '"');
            } else {
                header('Content-Disposition: attachment; filename="' . $showname . '"');
            }
            header("X-Sendfile: $realpath");
            exit;
        } else {
            $this->msg('error','文件不存在!');
            return false;
        }
    }


    public function msg($status,$info,$other=[]){
        $arr=['status'=>$status,'info'=>$info];
        if ($other){
            $arr['other']=$other;
        }
        $this->msg = $arr;
        exit(json_encode($arr));
    }
    
}