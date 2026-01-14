export interface Page<T> {
  content: T[];                // 核心数据：当前页的实体列表
  totalElements: number;       // 数据库中总记录数
  totalPages: number;          // 总页数
  size?: number;                // 每页显示的记录数
  number?: number;              // 当前页码（从 0 开始）
  numberOfElements?: number;    // 当前页实际返回的记录数
  first?: boolean;              // 是否是第一页
  last?: boolean;               // 是否是最后一页
  empty?: boolean;              // 是否为空页
  
  // 如果后端返回了 sort 信息，可以选填
  sort?: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  
  // 如果后端返回了 pageable 对象，也可以选填
  pageable?: any; 
}