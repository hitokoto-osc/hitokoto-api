'use strict'
/**
 * 该模块旨在在 v1 的基础上， 不做大型变更， 允许配置动态分配。
 * @author a632079
 */

// 私有变量
const dataEncrypt = Symbol('dataEncrypt')
const dataDecrypt = Symbol('dataDecrypt')
const generateSign = Symbol('generateSign')
const generateRequestBody = Symbol('generateRequestBody')

class Configure {
  construct (config) {
    /**
     * 初始化配置器
     */
    this.config = config
  }

  /**
   * 从配置服务器中取得配置
   */
  async getConfig () {

  }

  /**
   * 生成请求体
   * @returns {object}
   */
  [generateRequestBody] () {

  }

  /**
   * 生产请求签名
   * @returns {string}
   */
  [generateSign] () {

  }

  /**
   * 用于请求数据加密， 防止配置请求流程被恶意获取
   * @returns {string}
   */
  [dataEncrypt] () {

  }

  /**
   * 用于解密请求数据， 还原成基础配置
   * @returns {string}
   */
  [dataDecrypt] () {

  }
}
module.export = Configure
