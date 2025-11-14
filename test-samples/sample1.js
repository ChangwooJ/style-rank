import Lotto from './Lotto.js';
import PurchasedLotto from './domain/PurchasedLotto.js';
import WinningLotto from './domain/WinningLotto.js';
import { Console } from '@woowacourse/mission-utils';
import { printOrder } from './constant/config.js';
import { calculateLottoCount } from './util/calculateLottoCount.js';
import inputView from './view/InputView.js';
import { OutputView } from './view/outputView.js';
import {
  validateBonusNumber,
  validatePurchaseAmount,
} from './validate/validators.js';
import { parsingNumbers } from './util/parsingNumber.js';

class App {
  async run() {
    const amount = await this.#getPurchaseAmount();
    const lottoCount = calculateLottoCount(amount);
    const purchasedLotto = this.#printPurchasedLottos(lottoCount);

    const winningNumber = await this.#getWinningNumber();
    const bonusNumber = await this.#getBonusNumber(winningNumber);

    this.#printWinningResults(winningNumber, bonusNumber, purchasedLotto);
  }

  async #getPurchaseAmount() {
    while (true) {
      try {
        const input = await inputView.inputPurchaseAmount();
        return validatePurchaseAmount(input);
      } catch (error) {
        Console.print(error.message);
      }
    }
  }

  async #getWinningNumber() {
    while (true) {
      try {
        const winningNumber = await inputView.inputWinningNumber();
        const winningNumberArray = parsingNumbers(winningNumber);
        new Lotto(winningNumberArray);
        return winningNumberArray;
      } catch (error) {
        Console.print(error.message);
      }
    }
  }

  async #getBonusNumber(winningNumber) {
    while (true) {
      try {
        const input = await inputView.inputBonusNumber();
        return validateBonusNumber(input, winningNumber);
      } catch (error) {
        Console.print(error.message);
      }
    }
  }

  #printPurchasedLottos(count) {
    const purchasedLotto = new PurchasedLotto(count);
    OutputView.printPurchaseCount(count);

    purchasedLotto.getLottos().forEach((lotto) => {
      OutputView.printPurchaseLottos(numbersStr);
    });

    return purchasedLotto;
  }

  #printWinningResults(winningNumber, bonusNumber, purchasedLotto) {
    const winningLotto = new WinningLotto(
      winningNumber,
      bonusNumber,
      purchasedLotto
    );
    const { summary, ROI } = winningLotto.getResult();

    OutputView.printResultHeader();

    printOrder.forEach((rank) => {
      const count = summary[rank] ?? 0;
      OutputView.printWinningResult(rank, count);
    });

    OutputView.printROI(ROI);
  }
}

export default App;
