import React, { useEffect, useState } from 'react'

const WordFlick: React.FC = () => {
  const [words] = useState<string[]>([
    "Pong est un jeu électronique de simulation de tennis de table.\nLe principe est simple : deux joueurs s'affrontent dans un match où chacun contrôle une raquette virtuelle.\nLe but est de frapper une balle de manière à ce que l'adversaire ne puisse pas la renvoyer.\nSi un joueur manque la balle, son adversaire marque un point.\n\nComment jouer :\n1. Les joueurs déplacent avec la souris leurs raquettes verticalement pour frapper la balle.\n2.La partie se joue jusqu'à ce qu'un joueur atteigne 11 points",
  ])
  const [part, setPart] = useState<JSX.Element[]>([])
  const [index, setIndex] = useState<number>(0)
  const [offset, setOffset] = useState<number>(0)
  const [forwards, setForwards] = useState<boolean>(true)
  const [skipCount, setSkipCount] = useState<number>(0)

  const len: number = words.length
  const skipDelay = 40
  const speed = 20

  useEffect(() => {
    const interval = setInterval(() => {
      let newForwards = forwards
      let newSkipCount = skipCount
      let newIndex = index
      let newOffset = offset

      if (newForwards) {
        if (newOffset >= words[newIndex].length) {
          newSkipCount++
          if (newSkipCount === skipDelay) {
            newForwards = false
            newSkipCount = 0
          }
        }
      } else {
        if (newOffset === 0) {
          newForwards = true
          newIndex++
          newOffset = 0
          if (newIndex >= len) {
            newIndex = 0
          }
        }
      }

      if (newSkipCount === 0) {
        if (newForwards) {
          newOffset++
        }
      }

      const currentPart = words[newIndex].substr(0, newOffset)
      setPart(
        currentPart.split('\n').map((line, key) => (
          <span key={key}>
            {line}
            <br />
          </span>
        )),
      )
      setIndex(newIndex)
      setOffset(newOffset)
      setForwards(newForwards)
      setSkipCount(newSkipCount)
    }, speed)

    return () => clearInterval(interval)
  }, [forwards, index, offset, skipCount, words])

  return <div className='word'>{part}</div>
}

export default WordFlick
