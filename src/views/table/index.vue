<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.name"
        placeholder="商品名稱"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-input
        v-model="listQuery.description"
        placeholder="商品描述"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-select
        v-model="listQuery.category"
        placeholder="商品類型"
        clearable
        class="filter-item"
        style="width: 130px"
      >
        <el-option
          v-for="item in categoryList"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
      <el-button
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >
        搜尋
      </el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >
        添加商品
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column
        label="ID"
        prop="id"
        sortable="custom"
        align="center"
        width="180"
      >
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品名稱" min-width="80px">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{
            row.name
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品類型" min-width="80px">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{
           (categoryList.find(
              item => item.id === row.category_id) || {name: ''}).name

          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品描述" min-width="150px">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{
            row.description
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品價格" min-width="100px">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{
            row.price
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="圖片網址" width="180px" align="center">
        <template slot-scope="{row}">
          <img :src="row.picture_url" height="70px" />
          <!-- <span>{{ row.picture_url }}</span> -->
        </template>
      </el-table-column>
      <el-table-column label="剩餘數量" width="80px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.quantity }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="操作"
        align="center"
        width="200"
        class-name="fixed-width"
      >
        <template slot-scope="{row, $index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            編輯
          </el-button>
          <el-button
            v-if="row.status !== 'deleted'"
            size="mini"
            type="danger"
            @click="handleDelete(row, $index)"
          >
            刪除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="tempProductData"
        label-position="left"
        label-width="100px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="商品名稱" prop="name">
          <el-input v-model="tempProductData.name" />
        </el-form-item>
        <el-form-item label="商品類型">
          <el-select
            v-model="tempProductData.category_id"
            class="filter-item"
            placeholder="Please select"
          >
            <el-option
              v-for="item in categoryList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="圖片網址" prop="picture_url">
          <el-input v-model="tempProductData.picture_url" />
        </el-form-item>
        <el-form-item label="商品價格" prop="price">
          <el-input v-model="tempProductData.price" />
        </el-form-item>
        <el-form-item label="剩餘數量" prop="quantity">
          <el-input v-model="tempProductData.quantity" />
        </el-form-item>
        <el-form-item label="商品描述" prop="description">
          <el-input
            v-model="tempProductData.description"
            :autosize="{minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="Please input"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button
          type="primary"
          @click="dialogStatus === 'create' ? createData() : updateData()"
        >
          確定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Form } from 'element-ui'
import { cloneDeep } from 'lodash'
import { getProducts, defaultProductData, createProducts, updateProduct, getTotal } from '@/api/products'
import { getCategories } from '@/api/categories'
import { ICategoryData, IProductData } from '@/api/types'
import Pagination from '@/components/Pagination/index.vue'

const calendarTypeOptions = [
  { key: 'CN', displayName: 'China' },
  { key: 'US', displayName: 'USA' },
  { key: 'JP', displayName: 'Japan' },
  { key: 'EU', displayName: 'Eurozone' }
]

// arr to obj, such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce(
  (acc: { [key: string]: string }, cur) => {
    acc[cur.key] = cur.displayName
    return acc
  },
  {}
) as { [key: string]: string }

@Component({
  name: 'Table',
  components: {
    Pagination
  },
  filters: {
    typeFilter: (type: string) => {
      return calendarTypeKeyValue[type]
    }
  }
})
export default class extends Vue {
  private tableKey = 0;
  private list: IProductData[] = [];
  private total = 0;
  private listLoading = true;
  private listQuery = {
    page: 1,
    limit: 5,
    name: undefined,
    description: undefined,
    category: undefined
  };

  private importanceOptions = [1, 2, 3];
  private calendarTypeOptions = calendarTypeOptions;
  private sortOptions = [
    { label: 'ID Ascending', key: '+id' },
    { label: 'ID Descending', key: '-id' }
  ];

  // TODO
  private categoryList:ICategoryData[] = [];

  private statusOptions = ['published', 'draft', 'deleted'];
  private showReviewer = false;
  private dialogFormVisible = false;
  private dialogStatus = '';
  private textMap = {
    update: 'Edit',
    create: 'Create'
  };

  private dialogPageviewsVisible = false;
  private pageviewsData = [];
  private rules = {
    name: [{ required: true, message: 'name is required', trigger: 'change' }],
    category: [
      { required: true, message: 'category is required', trigger: 'change' }
    ],
    picture_url: [{ required: true, message: 'picture_url is required', trigger: 'blur' }],
    price: [{ required: true, message: 'price is required', trigger: 'change' }],

    quantity: [{ required: true, message: 'quantity is required', trigger: 'change' }]
  };

  private downloadLoading = false;
  private tempProductData = defaultProductData;

  created() {
    this.getCategoryList()
    this.getList()
  }

  private async getCategoryList() {
    const res = await getCategories()
    this.categoryList = res.data
  }

  private async getList() {
    this.listLoading = true
    const { data } = await getProducts(this.listQuery)
    this.list = data
    this.total = Number((await getTotal()).data[0].count)
    // Just to simulate the time of the request
    setTimeout(() => {
      this.listLoading = false
    }, 0.5 * 1000)
  }

  private handleFilter() {
    this.listQuery.page = 1
    this.getList()
  }

  private handleModifyStatus(row: any, status: string) {
    this.$message({
      message: '操作成功',
      type: 'success'
    })
    row.status = status
  }

  private resetTempProductData() {
    this.tempProductData = cloneDeep(defaultProductData)
  }

  private handleCreate() {
    this.resetTempProductData()
    this.dialogStatus = 'create'
    this.dialogFormVisible = true
    this.$nextTick(() => {
      (this.$refs.dataForm as Form).clearValidate()
    })
  }

  private createData() {
    (this.$refs.dataForm as Form).validate(async valid => {
      if (valid) {
        const productData = this.tempProductData
        const data = await createProducts(productData)
        if (!data) { return }
        this.list.unshift(data)
        this.dialogFormVisible = false
        this.$notify({
          title: '成功',
          message: '創建成功',
          type: 'success',
          duration: 2000
        })
      }
    })
  }

  private handleUpdate(row: any) {
    this.tempProductData = Object.assign({}, row)
    this.dialogStatus = 'update'
    this.dialogFormVisible = true
    this.$nextTick(() => {
      (this.$refs.dataForm as Form).clearValidate()
    })
  }

  private updateData() {
    (this.$refs.dataForm as Form).validate(async valid => {
      if (valid) {
        const tempData = Object.assign({}, this.tempProductData)
        if (!tempData.id) {
          return
        }
        const data = await updateProduct(tempData.id, tempData)
        if (!data) { return }

        const index = this.list.findIndex(v => v.id === data.id)
        this.list.splice(index, 1, data)
        this.dialogFormVisible = false
        this.$notify({
          title: '成功',
          message: '更新成功',
          type: 'success',
          duration: 2000
        })
      }
    })
  }

  private handleDelete(row: any, index: number) {
    this.$notify({
      title: 'Success',
      message: 'Delete Successfully',
      type: 'success',
      duration: 2000
    })
    this.list.splice(index, 1)
  }
}
</script>
