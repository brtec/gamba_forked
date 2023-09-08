import React from 'react'
import { useNavigate } from 'react-router-dom'
import { cx } from '../../utils'
import styles from './Button.module.css'

type ButtonSize = 'small' | 'medium' | 'large'

type ButtonColor = 'default' | 'white'

type ButtonVariant = 'solid' | 'outlined' | 'ghost' | 'soft'

interface ElementProps {
  button: React.ButtonHTMLAttributes<HTMLButtonElement>
  a: React.AnchorHTMLAttributes<HTMLAnchorElement>
}

type Element = keyof ElementProps

interface ButtonProps<E extends Element> {
  as?: E
  size?: ButtonSize
  variant?: ButtonVariant
  color?: ButtonColor
  pulse?: boolean
  icon?: JSX.Element
  loading?: boolean
}

export function Button2<E extends Element>(
  props: ButtonProps<E> & ElementProps[E],
) {
  const {
    as: Element = 'button',
    loading = false,
    children,
    size = 'medium',
    variant = 'solid',
    color = 'default',
    pulse,
    icon,
    className,
    ...rest
  } = props

  return (
    <Element
      className={
        cx(
          styles.button,
          styles[`variant-${variant}`],
          styles[`size-${size}`],
          styles[`color-${color}`],
          pulse && styles['pulse'],
          className,
        )
      }
      {...rest}
    >
      {children}
      {loading ? (
        <span className={styles.icon}>
          <div className={styles.loader} />
        </span>
      ) : icon ? (
        <span className={styles.icon}>
          {icon}
        </span>
      ) : null}
    </Element>
  )
}

export function NavButton(props: ButtonProps<'button'> & Omit<ElementProps['button'], 'onClick'> & {to: string}) {
  const navigate = useNavigate()
  return (
    <Button2 {...props} onClick={() => navigate(props.to)} />
  )
}