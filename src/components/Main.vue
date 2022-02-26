<template>
  <div class="hello">
    <h2 class="text-success">{{ msg }}</h2>
    <h5>By liangxin at 2022-02-20</h5>

    <el-steps :active="step" align-center>
      <el-step title="1.Upload SRT file" ></el-step>
      <el-step title="2.Edit Timeline Or translate" ></el-step>
      <el-step title="3.Test Subtitle" ></el-step>
      <el-step title="4.Export File" description=""></el-step>
    </el-steps>
  </div>
  <el-divider></el-divider>
  <el-upload v-show="showUpload"
      action="liangxin"
      class="upload-demo"
      :disabled="false"
      drag
      accept=".srt"
      :on-success="(response, file, fileList) => {$message.success(`11111111111` );filePath = fileList.map(item => (item.response && item.response.url)|| item.url).join('|')}"
      :limit="1"
      :http-request="uploadFile"
      :file-list="filePathArra"
      :on-exceed="(files,fileList) => ($message.warning(`当前限制1个文件，但选择了${files.length}个字幕，共选择了${files.length + fileList.length}个字幕`))"
  >
    <el-icon class="el-icon--upload"><upload-filled /></el-icon>
    <div class="el-upload__text">
      Drop file here or <em>click to upload</em>
    </div>
    <template #tip>
      <div class="el-upload__tip">
        SRT files with a size less than 500kb
      </div>
    </template>
  </el-upload>

<div v-show="showList" >
  <el-form :inline="true" :model="formInline" class="demo-form-inline">
  <el-form-item label="Name" class="el-col-sm-6">
    <el-input disabled="true" v-model="fileName" placeholder=""></el-input>
  </el-form-item>
  <el-form-item label="Size" class="el-col-sm-3">
    <el-input disabled="true" v-model="fileSize" placeholder="">
      <template #append>KB</template>
    </el-input>
  </el-form-item>
    <el-form-item label="Lines" class="el-col-sm-2">
      <el-input disabled="true" v-model="fileLines" placeholder="">
      </el-input>
    </el-form-item>


    <el-form-item label="Shift" class="el-col-sm-3">
    <el-input-number
        v-model="timeShift"
        :min="-10000"
        :max="10000"
        controls-position="right"

        @change="handleChange"
    />
    </el-form-item>
    <el-form-item class="el-col-sm-2">
      <el-select  v-model="shiftUint" class="m-2" placeholder="Select">
        <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
        >
        </el-option>
      </el-select>
    </el-form-item>
  <el-form-item class="el-col-sm-20">
    <el-button type="success" :icon="SuccessFilled" @click="shiftTime">EnterShift</el-button>
    <el-button type="warning" :icon="VideoPlay" @click="onSubmit">Test</el-button>
    <el-button type="primary" :icon="Switch" @click="translateAll">Transition</el-button>
    <el-button type="danger" :icon="Download" @click="download"> <a  style="color: #f6f8f7;text-decoration: none;" class="download" :download="`[New]`+fileName" :href="`data:text/srt;charset=utf-8,`+this.srt.srtContent">Download</a></el-button>
  </el-form-item>
  </el-form>
  <audio   :src="playSrc" autoplay  id="playSubtitle"></audio>
  <el-table :data="tableData" size="mini"  class="table" v-loading="loading" height="300" style="width: 100%">
    <el-table-column prop="counter" label="#" width="80" />
    <el-table-column prop="start.text" label="Start" width="180" />
    <el-table-column prop="end.text" label="End" width="180" />
    <el-table-column prop="subtitle" label="Subtitle" width="500" >
      <template #default="scope">
        <span v-if="showSubtitle[scope.$index]">
          <el-row>
            <el-col :span="20">
                <el-input   v-model="scope.row.subtitle" placeholder="Translate Text">
       </el-input>
            </el-col>
            <el-col :span="4">
              <el-button type="text"  size="mini" :icon="CircleCheck" plain @click="finishEdit(scope.$index)" circle></el-button>

            </el-col>
          </el-row>
           </span>
        <span v-else>{{scope.row.subtitle}}<el-button type="primary"  plain size="mini" :icon="Edit" @click="editLine(scope.$index)" circle></el-button>
       <el-button type="danger" size="mini" :icon="VideoPlay" plain @click="play(scope.row.counter,scope.row.subtitle)" circle></el-button>
          <el-button type="success" size="mini" :icon="Switch" plain @click="translteLine(scope.row.counter,scope.row.subtitle)" circle></el-button>
     </span>
      </template>
    </el-table-column>
    <el-table-column prop="translate" label="Translate" width="500" >
      <template #default="scope">
        <el-input  :id="`translate`+scope.row.counter" v-model="scope.row.translate" placeholder="Translate Text"></el-input>
      </template>
    </el-table-column>
  </el-table>
  <el-pagination
      v-model:currentPage="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="[10, 20, 50, 100]"
      :small="small"
      :disabled="disabled"
      :background="true"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
  >
  </el-pagination>
</div>
</template>
<script setup>
import { UploadFilled , SuccessFilled,VideoPlay,Switch,Download,Edit,CircleCheck} from '@element-plus/icons-vue'
</script>
<script >
import axios  from 'axios'
import md5 from 'md5'
import   Srt  from 'srtjs'
export default {
  data(){
    return{
      options :[
        {
          value: 'hours',
          label: 'Hours',
        },
        {
          value: 'minutes',
          label: 'Minutes',
        },
        {
          value: 'seconds',
          label: 'Seconds',
        },
        {
          value: 'milliseconds',
          label: 'Milliseconds',
        }
      ],
      shiftUint:'milliseconds',
      filePath:'',
      showSubtitle:[],
      step:1,
      playSrc:'http://dict.youdao.com/dictvoice?type=1&audio=liangxin',
      fileName:'',
      fileSize:0,
      fileLines:0,
isEdit:false,
      timeShift:0,
      loading:false,
      srtData:[],
      srt:Object,
      tableData:[
        {counter:0,
          start:[],
          end:[],
          subtitle:'',
          translate:''
        }

      ],
      filePathArra:[],
      srtText:'',
      total:0,
      isPlay: false,
      currentPage:1,
      pageSize:20,
      showUpload:true,
      showList:false
    }
  },
  name: 'HelloWorld',
  props: {
    msg: String
  },
  mounted() {

  },
  methods:{
    refreshList(){
      let benginPage = (this.currentPage-1)*this.pageSize
      this.tableData =  this.srtData.slice(benginPage,benginPage+this.pageSize)
      this.loading = false
    },
    beforeUpload(file) {

      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        this.$message.error("Subtitle file size less then 2MB!");
        return isLt2M;
      }
      return  isLt2M;
    },
    translteLine(count,en){
      axios.get('https://api.66mz8.com/api/translation.php?info='+en+'')
            .then(function (response) {
              if(response && response.data && response.data.code == 200){
                  document.getElementById('translate'+count).value  =  response.data.fanyi;
                  this.srtData[count].translate = response.data.fanyi
                this.refreshList()
              }
            })
    },

   translateAll() {
      // for (var i =0;  i< this.fileLines; i++ ){
      //   axios.get('http://api.fanyi.baidu.com/api/trans/vip/translate?q='+this.srtData[i].subtitle+'&from=en&to=zh&appid=20220221001088676&salt=1435660288&sign=f89f9594663708c1605f3d736d01d2d4')
      //       .then(function (response) {
      //         if(response && response.data && response.data.code == 200){
      //           this.srtData[i].translate =  response.data.fanyi;
      //         }
      //       })
      // }
      // this.refreshList()
     // baiduTranslator('Space Force eyes lower-cost sensors to monitor geostationary orbit', 'en', 'zh', {}).then(value => {
     //   console.log(value);
     // });

  },

    play(line,subtitle){

     this.playSrc = 'http://dict.youdao.com/dictvoice?type=0&audio='+subtitle
      let tts = document.getElementById('playSubtitle')
      tts.play()


      // axios.get(`/tran/dictvoice?type=1&audio=i%20am%20dog`).then(function (response) {
      //       if(response){
      //         console.log(response.data)
      //         // var a  = response.data;
      //
      //       }
      //     })

    },
uploadFile(file) {
      this.fileName = file.file.name
      this.fileSize =file.file.size
      this.showUpload = false
      this.showList = true
      this.loading=true
       this.upload(file.file).then((result)=>{this.step=2
          // var Srt = require('srtjs')
         this.srt = new Srt(result);
          console.log(this.srt)
          this.srtData  = this.srt.lines
          this.refreshList()
          this.fileLines= this.srtData.length
          this.total = this.fileLines


       })
      },

      upload(file){
        // eslint-disable-next-line no-unused-vars
        return new Promise((resolve, reject) =>{
          let reader = new FileReader()
          reader.readAsText(file,'utf-8');
          reader.onload = function() {
            resolve(this.result)
          }
        })
      },
    editLine(index){

      this.showSubtitle[index] = true
    },
    finishEdit(index){
      this.showSubtitle[index] = false
    },
    handleCurrentChange  (val)  {
      this.currentPage = val;
      this.refreshList();
    },
    shiftTime(){
      this.srt.shift(this.timeShift, this.shiftUint);
      this.refreshList()

    },
    download(){
    }

  }

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
