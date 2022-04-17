import { logDOM } from '@testing-library/react';
import React from 'react';
import './index.css';

/**
 * 虚拟列表区域：视图区 + 缓冲区 + 虚拟区
 * 视图区：视图区就是能够直观看到的列表区，此时的元素都是真实的 DOM 元素。
 * 缓冲区：缓冲区是为了防止用户上滑或者下滑过程中，出现白屏等效果。（缓冲区和视图区为渲染真实的 DOM ）
 * 虚拟区：对于用户看不见的区域（除了缓冲区），剩下的区域，不需要渲染真实的 DOM 元素。虚拟列表就是通过这个方式来减少页面上 DOM 元素的数量。
 *
 */

/**
 * 思路分析
 * 1.通过 useRef 获取元素，缓存变量。
 * 2.useEffect 初始化计算容器的高度。截取初始化列表长度。这里需要 div 占位，撑起滚动条。
 * 3.通过监听滚动容器的 onScroll 事件，根据 scrollTop 来计算渲染区域向上偏移量, 这里需要注意的是，当用户向下滑动的时候，为了渲染区域，能在可视区域内，可视区域要向上滚动；当用户向上滑动的时候，可视区域要向下滚动。
 * 4.通过重新计算 end 和 start 来重新渲染列表。
 */

function LongList() {
  /**
   * 原始数据
   */
  const [dataList, setDataList] = React.useState([]);
  /**
   * 截取缓冲区 + 视图区 索引
   */
  const [position, setPosition] = React.useState([0, 0]);
  /**
   * 获取scroll元素
   */
  const scroll = React.useRef(null);
  /**
   * 获取元素用于容器高度
   */
  const box = React.useRef(null);
  /**
   * 用于移动视图区域，形成滑动效果
   */
  const context = React.useRef(null);
  const scrollInfo = React.useRef({
    height: 500 /* 容器高度 */,
    bufferCount: 8 /* 缓冲区个数 */,
    itemHeight: 60 /* 每一个item高度 */,
    renderCount: 0 /* 渲染区个数 */,
  });

  // 这里为什么调用了两次？？？
  React.useEffect(() => {
    const height = box.current.offsetHeight;
    const { itemHeight, bufferCount } = scrollInfo.current;
    console.log('可视区域高度', height);
    // 渲染数量 = （可视区域高度 / 每项高度）+ 缓冲区个数
    const renderCount = Math.ceil(height / itemHeight) + bufferCount;

    console.log('渲染数量', renderCount);
    scrollInfo.current = {
      renderCount,
      height,
      bufferCount,
      itemHeight,
    };

    // 列表中添加数据
    const list = new Array(10000).fill(1).map((item, index) => index + 1);
    setDataList(list);
    setPosition([0, renderCount]);
  }, []);

  const handleScroll = () => {
    const { scrollTop } = scroll.current;
    const { itemHeight, renderCount } = scrollInfo.current;
    const currentOffset = scrollTop - (scrollTop % itemHeight);
    const start = Math.floor(scrollTop / itemHeight);
    context.current.style.transform = `translate3d(0, ${currentOffset}px, 0)`;
    const end = Math.floor(scrollTop / itemHeight + renderCount + 1);
    if (end !== position[1] || start !== position[0]) {
      setPosition([start, end]);
    }
  };

  const { itemHeight, height } = scrollInfo.current;
  const [start, end] = position;
  const renderList = dataList.slice(start, end);
  return (
    <>
      <div className='list-box' ref={box}>
        <div
          className='scroll-box'
          style={{ height: height + 'px' }}
          ref={scroll}
          onScroll={handleScroll}
        >
          <div
            className='scroll-hold'
            style={{ height: `${dataList.length * itemHeight}px` }}
          ></div>
          <div className='context' ref={context}>
            {renderList.map((item, index) => {
              return (
                <div className='list' kye={index}>
                  {item + ''} Item
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

export default LongList;
