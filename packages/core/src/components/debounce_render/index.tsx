/**
 * https://github.com/podefr/react-debounce-render/blob/master/src/index.js
 * 防止组件短时间内连续并发渲染
 */

import hoistNonReactStatics from 'hoist-non-react-statics'
import { debounce as lodashDebounce, DebounceSettings, uniqueId } from 'lodash'
import React, { Component, useEffect, useMemo, useRef, useState } from 'react'

function debounceRender<T>(ComponentToDebounce: T, wait?: number, setting?: DebounceSettings): T {
  const DebounceComponent: any = ComponentToDebounce
  // @ts-ignore
  class DebouncedContainer extends Component {
    updateDebounced = lodashDebounce(this.forceUpdate, wait, setting)

    shouldComponentUpdate() {
      this.updateDebounced()
      return false
    }

    componentWillUnmount() {
      this.updateDebounced.cancel()
    }

    render() {
      return <DebounceComponent {...this.props} />
    }
  }
  return hoistNonReactStatics(DebouncedContainer, DebounceComponent) as any
}

type UseDebounceRenderOption = {
  getComponent: () => JSX.Element
  wait?: number
  setting?: DebounceSettings
}

export const useDebounceRender = (
  option: UseDebounceRenderOption,
  deeps: any[]
): JSX.Element | null => {
  const { getComponent, wait, setting } = option
  const [refreshKey, setRefreshKey] = useState('')
  const refreshTrigger = useRef<any>()

  useEffect(() => {
    if (!refreshTrigger.current) {
      refreshTrigger.current = lodashDebounce(
        () => {
          setRefreshKey(uniqueId())
        },
        wait,
        setting
      )
    }
    if (wait) {
      refreshTrigger.current()
    }
  }, deeps)
  const CachedComponent = useMemo(() => {
    return !refreshKey ? null : getComponent()
  }, [refreshKey])

  return CachedComponent
}

export default debounceRender
